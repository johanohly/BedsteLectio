<script lang="ts">
    import { RequestData } from "$components";
    import { authStore } from "$lib/stores";
    import type { DocumentItem, RawDocumentItem } from "$lib/types/documents";
    import { getFileIcon } from "$lib/utilities";
    import { Folder, Undo2 } from "lucide-svelte";

    let items: DocumentItem[] = [];

    let initialLoading = true;
    let initialData: { indhold: RawDocumentItem[]; titel: string };
    let initialItems: DocumentItem[];
    $: if (!initialLoading && initialData) {
        initialItems = initialData.indhold.map((item) => {
            if (item.type === "dokument") {
                return {
                    type: "file",
                    name: item.navn,
                    id: item.id,
                    author: item.ændret_af,
                    date: item.dato,
                    fileType: item.navn.split(".").pop() ?? "",
                    link: item.id.includes("/res") ? `https://www.lectio.dk/lectio/${$authStore.school}/lc/${item.id}` : `https://www.lectio.dk/lectio/${$authStore.school}/dokumenthent.aspx?documentid=${item.id}`,
                };
            } else {
                return {
                    type: "folder",
                    name: item.navn,
                    id: item.id,
                };
            }
        });
        items = JSON.parse(JSON.stringify(initialItems));
    }

    let folderLoading = false;
    let folderData: { indhold: RawDocumentItem[]; titel: string };
    let folderTitle: string;
    $: if (!folderLoading && folderData?.indhold?.length) {
        folderTitle = folderData.titel;
        items = folderData.indhold.map((item) => {
            if (item.type === "dokument") {
                return {
                    type: "file",
                    name: item.navn,
                    id: item.id,
                    author: item.ændret_af,
                    date: item.dato,
                    fileType: item.navn.split(".").pop() ?? "",
                    link: item.id.includes("/res") ? `https://www.lectio.dk/lectio/${$authStore.school}/lc/${item.id}` : `https://www.lectio.dk/lectio/${$authStore.school}/dokumenthent.aspx?documentid=${item.id}`,
                };
            } else {
                return {
                    type: "folder",
                    name: item.navn,
                    id: item.id,
                };
            }
        });
    }
    let folderId: string;
</script>

<RequestData bind:data={initialData} bind:loading={initialLoading} path="dokumenter" />
{#if folderId}
    {#key folderId}
        <RequestData bind:data={folderData} bind:loading={folderLoading} path={`dokumenter?folderid=${folderId}`} />
    {/key}
{/if}

<div class="page-container">
    {#if (!initialLoading || !folderLoading) && items.length}
        <h1>{folderTitle ? folderTitle : "Dokumenter"}</h1>
        <div class="bg-white dark:bg-dark border-[1px] rounded-md">
            {#each items as item, i}
                {#if item.type === "folder"}
                    <div
                        on:click={() => {
                            if (item.id === "..") {
                                folderTitle = "";
                                items = JSON.parse(JSON.stringify(initialItems));
                            } else {
                                items = [];
                                folderId = item.id;
                            }
                        }}
                        on:keydown={() => {}}
                        class="cursor-pointer bg-white dark:bg-dark hover:bg-light dark:hover:bg-dark-hover relative flex p-4 py-2 {i != 0 ? (i != items.length - 1 ? 'border-t-[1px]' : 'border-t-[1px] rounded-b-md') : 'rounded-t-md'}"
                    >
                        <div class="mr-4 flex">
                            {#if item.name === ".."}
                                <Undo2 class="self-end w-6 h-6 flex-shrink-0" />
                            {:else}
                                <Folder class="self-end w-6 h-6 flex-shrink-0" />
                            {/if}
                        </div>
                        <div class="mr-4 min-w-0 flex-[auto]">
                            <span class="overflow-hidden overflow-ellipsis whitespace-nowrap block max-w-full">{item.name}</span>
                        </div>
                    </div>
                {:else}
                    <a href={item.link} target="_blank" class="not-prose cursor-pointer bg-white dark:bg-dark hover:bg-light dark:hover:bg-dark-hover relative flex p-4 py-2 {i != 0 ? (i != items.length - 1 ? 'border-t-[1px]' : 'border-t-[1px] rounded-b-md') : 'rounded-t-md'}">
                        <div class="mr-4 flex">
                            <svelte:component this={getFileIcon(item.fileType)} class="self-end w-6 h-6 flex-shrink-0" />
                        </div>
                        <div class="mr-4 min-w-0 flex-[auto] w-6 md:w-10">
                            <span class="overflow-hidden overflow-ellipsis whitespace-nowrap block max-w-full">{item.name}</span>
                        </div>
                        <div class="mr-4 min-w-0 flex-[auto] hidden md:block w-6 md:w-10">
                            <span class="overflow-hidden overflow-ellipsis whitespace-nowrap block max-w-full text-gray-500">{item.author}</span>
                        </div>
                        <div class="w-[150px] text-right text-gray-500">
                            <span class="whitespace-nowrap">
                                {item.date}
                            </span>
                        </div>
                    </a>
                {/if}
            {/each}
        </div>
    {:else}
        <p>Loading...</p>
    {/if}
</div>
