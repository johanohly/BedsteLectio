<script lang="ts">
    import { createTable, Subscribe, Render } from "svelte-headless-table";
    import { addSortBy, addPagination, addTableFilter } from "svelte-headless-table/plugins";
    import * as Table from "$lib/components/ui/table";
    import { RequestData } from "$components";
    import { Button } from "$components/ui/button";
    import { writable, type Writable } from "svelte/store";
    import { cn } from "$lib/utils";
    import { ArrowUpDown } from "lucide-svelte";
    import { filter } from "fuzzy";

    let roomLoading = true;
    let roomData: { lokaler: { [key: string]: string } };
    let occupiedLoading = true;
    let occupiedData: { lokale: string; status: "ledigt" | "optaget" }[];
    let entries: Writable<{ occupied: boolean; name: string; calendar: string }[]> = writable([]);
    $: if (!roomLoading && !occupiedLoading && roomData && occupiedData) {
        const occupied = occupiedData.map((room) => {
            return { lokale: room.lokale.replace("Lokale ", ""), status: room.status };
        });
        const rooms = occupied
            .filter((room) => Object.keys(roomData.lokaler).includes(room.lokale))
            .map((room) => {
                const rawId = roomData.lokaler[room.lokale];
                let roomId = rawId;
                if (roomId) roomId = roomId.replace("RO", "R");
                return {
                    occupied: room.status === "optaget",
                    name: room.lokale,
                    calendar: roomId,
                };
            });
        entries.set(rooms);
    }

    const table = createTable(entries, {
        sort: addSortBy({ disableMultiSort: true, initialSortKeys: [{ id: "occupied", order: "desc" }], toggleOrder: ["desc", "asc"] }),
        page: addPagination(),
        filter: addTableFilter({
            fn: ({ filterValue, value }) => filter(filterValue, [value]).length > 0,
        }),
    });

    const columns = table.createColumns([
        table.column({
            header: "Ledigt",
            accessor: "occupied",
            plugins: {
                sort: {
                    compareFn(left, right) {
                        if (left === right) return 0;
                        if (right) return 1;
                        return -1;
                    },
                },
            },
        }),
        table.column({
            header: "Navn",
            accessor: "name",
        }),
        table.column({
            header: "Skema",
            accessor: "calendar",
            plugins: {
                sort: {
                    disable: true,
                },
            },
        }),
    ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns);

    const { sortKeys } = pluginStates.sort;

    const { hasNextPage, hasPreviousPage, pageIndex, pageCount } = pluginStates.page;
    const { filterValue } = pluginStates.filter;
</script>

<RequestData bind:data={roomData} bind:loading={roomLoading} path="informationer" />
<RequestData bind:data={occupiedData} bind:loading={occupiedLoading} path="ledige_lokaler" />

<div class="page-container w-full">
    <h1>Lokaler</h1>
    <input class="bg-white dark:bg-dark text-sm rounded-lg block h-10 p-2.5 dark:placeholder:text-[#3b3b3b] focus:ring-blue-500 focus:border-blue-500 w-full max-w-md" placeholder="Søg efter lokale..." type="text" bind:value={$filterValue} />
    <div class="p-4 rounded-md bg-white dark:bg-dark">
        <Table.Root {...$tableAttrs}>
            <Table.Header>
                {#each $headerRows as headerRow}
                    <Subscribe rowAttrs={headerRow.attrs()}>
                        <Table.Row>
                            {#each headerRow.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                                    <Table.Head {...attrs}>
                                        {#if !props.sort.disabled}
                                            <Button variant="ghost" on:click={props.sort.toggle}>
                                                <Render of={cell.render()} />
                                                <ArrowUpDown class={cn($sortKeys[0]?.id === cell.id && "text-foreground", "ml-2 h-4 w-4")} />
                                            </Button>
                                        {:else if cell.id === "calendar"}
                                            <div class="text-right">
                                                <Render of={cell.render()} />
                                            </div>
                                        {:else}
                                            <Render of={cell.render()} />
                                        {/if}
                                    </Table.Head>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Header>
            <Table.Body {...$tableBodyAttrs}>
                {#each $pageRows as row (row.id)}
                    <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                        <Table.Row {...rowAttrs}>
                            {#each row.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs>
                                    <Table.Cell class={cell.id === "calendar" ? "flex justify-end" : ""} {...attrs}>
                                        {#if cell.id === "occupied"}
                                            {#if cell.value}
                                                <Button variant="destructive">Nej</Button>
                                            {:else}
                                                <Button class="bg-green-400">Ja</Button>
                                            {/if}
                                        {:else if cell.id === "calendar"}
                                            <Button class="justify-end" href={`/skema?id=${cell.value}`}>Se Skema</Button>
                                        {:else}
                                            <Render of={cell.render()} />
                                        {/if}
                                    </Table.Cell>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="!mt-0 flex items-center justify-end space-x-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
            Side {$pageIndex + 1} af {$pageCount}
        </div>
        <Button variant="outline" size="sm" on:click={() => ($pageIndex = $pageIndex - 1)} disabled={!$hasPreviousPage}>Tidligere</Button>
        <Button variant="outline" size="sm" disabled={!$hasNextPage} on:click={() => ($pageIndex = $pageIndex + 1)}>Næste</Button>
    </div>
</div>
