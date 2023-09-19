<script lang="ts">
    import { RequestData } from "$components";
    import type { FileTree } from "$lib/types/documents";
    import { Folder, MinusSquare, PlusSquare } from "lucide-svelte";

    let fileTree: FileTree | undefined = undefined;

    let loading = true;
    let data: { indhold: { id: string; navn: string; type: "folder" | "dokument" }[] };
    $: if (!loading && data) {
        fileTree = {
            type: "folder",
            name: "root",
            open: true,
            children: data.indhold.map((item) => {
                return {
                    name: item.navn,
                    type: item.type === "folder" ? "folder" : "file",
                    open: false,
                    children: [],
                };
            }),
        };
        console.log(fileTree);
    }
</script>

<RequestData bind:data bind:loading path="dokumenter" />

<div class="page-container">
    {#if fileTree && fileTree.children}
        <!-- svelte-ignore a11y-missing-attribute -->
        <div class="flex flex-[1] flex-col pl-6 text-sm text-black dark:text-white not-prose">
            {#each fileTree.children as item}
                {#if item.type === "folder"}
                    <li class="list-none leading-7 whitespace-nowrap select-none">
                        <a
                            on:click={() => {
                                item.open = true;
                            }}
                            on:keydown={() => {}}
                            class="flex flex-row items-center"
                            title={item.name}
                        >
                            <span class="-ml-6 mr-[14px]">
                                {#if item.open}
                                    <MinusSquare class="w-4 h-4" />
                                {:else}
                                    <PlusSquare class="w-4 h-4" />
                                {/if}
                            </span>
                            <Folder class="w-5 h-5 mr-2" />
                            <span>{item.name}</span>
                        </a>
                    </li>
                {:else}
                    file
                {/if}
            {/each}
        </div>
    {/if}
</div>
