<script lang="ts">
    import type { FullMessage, Message, RawFullMessage, RawMessage } from "$lib/types/messages";

    import { RequestData } from "$components";
    import { Avatar } from "$components/ui/avatar";
    import { Badge } from "$components/ui/badge";
    import { Skeleton } from "$components/ui/skeleton";
    import { Tooltip } from "$components/ui/tooltip";
    import { authStore } from "$lib/stores";
    import { decodeUserID } from "$lib/utilities/cookie";
    import { ChevronDown, ChevronUp, Minus, Plus, RotateCcw, Search, Send } from "lucide-svelte";
    import { DateTime } from "luxon";
    import { fly, slide } from "svelte/transition";
    import SvelteMarkdown from "svelte-markdown";
    import { createCollapsible, melt } from "@melt-ui/svelte";
    import { test } from "fuzzy";
    import { Tab } from "$components/ui/tab";
    import { Datetime } from "$components/ui/datetime";
    import { Button } from "$components/ui/button";

    let students: { id: string; name: string }[] | undefined = undefined;
    let dataStudents: { elever: { [key: string]: string }; lærere: { [key: string]: string } };
    $: if (dataStudents) {
        students = Object.entries({ ...dataStudents.elever, ...dataStudents.lærere } ?? {}).map(([name, id]) => {
            const formatted = name.split(" (")[0].split(" -")[0];
            return {
                id,
                name: formatted,
            };
        });
    }
    $: me = students?.find((student) => student.id == `S${decodeUserID($authStore.cookie)}`);

    let loading = true;
    let data: RawMessage[] = [];
    let messages: Message[];

    $: if (!loading && data) {
        messages = data.map((message) => {
            return {
                date: DateTime.fromFormat(message.dato, "d/M-yyyy HH:mm", {
                    locale: "da",
                }),
                id: +message.message_id,
                receivers: message.modtagere,
                sender: message.førsteBesked.split(" (")[0].split(" -")[0],
                title: message.emne,
            };
        });
    }

    let searchTerm = "";
    let searchFilter: "All" | "Received" | "Sent" = "All";
    let searchFrom = "";
    let searchTo = "";
    $: searchResetable = searchTerm != "" || searchFilter != "All" || searchFrom != "" || searchTo != "";
    $: filteredMessages = messages
        ? messages.filter((message) => {
              if (searchFilter != "All") {
                  if (message.sender == me?.name && searchFilter == "Received") return false;
                  if (message.sender != me?.name && searchFilter == "Sent") return false;
              }
              if (searchFrom) {
                  if (DateTime.fromISO(searchFrom).plus({ hours: 2 }) > message.date) return false;
              }
              if (searchTo) {
                  if (DateTime.fromISO(searchTo).plus({ hours: 2 }) < message.date) return false;
              }
              return test(searchTerm, message.title);
          })
        : [];

    let selectedMessage: number | undefined = undefined;

    let dataMessage: RawFullMessage | undefined = undefined;
    let fullMessage: FullMessage | undefined = undefined;
    let messageLoading: boolean;
    $: if (dataMessage && dataMessage.beskeder) {
        fullMessage = {
            messages: dataMessage.beskeder.map((message) => {
                return {
                    attachments: message.vedhæftninger
                        ? message.vedhæftninger.map((attachment) => {
                              return {
                                  link: attachment.href,
                                  name: attachment.navn,
                              };
                          })
                        : [],
                    body: message.besked.replaceAll("@", "@<!-- -->").replaceAll(/^.*Redigeret af.*$/gm, ""),
                    date: DateTime.fromFormat(message.dato, "d/M-yyyy HH:mm", {
                        locale: "da",
                    }),
                    edits: message.besked.match(/^.*Redigeret af.*$/gm) ?? [],
                    sender: { id: message.bruger.id, name: message.bruger.navn.split(" (")[0].split(" -")[0] },
                    title: message.titel,
                };
            }),
            receivers: dataMessage.modtagere,
        };
    }

    const {
        elements: { root, content, trigger },
        states: { open },
    } = createCollapsible();

    let element: HTMLDivElement;
    let height = 0;
    $: if (height > 0) {
        element.style.height = `${height - 57}px`;
    }

    let sidebar: HTMLDivElement;
    // {selectedMessage ? 'hidden lg:w-1/3 xl:w-[40rem] 2xl:w-[60rem]' : 'w-full'}
    $: if (sidebar) {
        if (selectedMessage) {
            sidebar.classList.remove("w-full");
            sidebar.classList.add("hidden", "lg:w-1/3", "xl:w-[40rem]", "2xl:w-[60rem]");
        } else {
            setTimeout(() => {
                sidebar.classList.remove("hidden", "lg:w-1/3", "xl:w-[40rem]", "2xl:w-[60rem]");
                sidebar.classList.add("w-full");
            }, 500);
        }
    }
</script>

<RequestData bind:data={dataStudents} path="informationer" />
<RequestData bind:data bind:loading path="beskeder2" />
{#key selectedMessage}
    {#if selectedMessage}
        <RequestData bind:data={dataMessage} bind:loading={messageLoading} path={`besked?id=${selectedMessage}`} />
    {/if}
{/key}

<svelte:window bind:innerHeight={height} />

<div bind:this={element} class="{!selectedMessage ? 'page-container !pt-0' : ''} w-full flex flex-col lg:flex-row">
    <div bind:this={sidebar} style="transition: width 1000ms ease;" class="lg:flex flex-col">
        <header use:melt={$root} class="border-b dark:border-white/10 p-4">
            <div class="flex items-center">
                <button use:melt={$trigger} disabled={loading} class="flex items-center p-2 rounded-md hover:bg-light-hover dark:hover:bg-dark">
                    <h3 class="m-0">Filtre</h3>
                    {#if $open}
                        <ChevronUp class="ml-1 square-5" />
                    {:else}
                        <ChevronDown class="ml-1 square-5" />
                    {/if}
                </button>
                {#if searchResetable}
                    <Tooltip text="Nulstil alle filtre">
                        <button
                            on:click={() => {
                                searchTerm = "";
                                searchFilter = "All";
                                searchFrom = "";
                                searchTo = "";
                            }}
                            class="flex items-center justify-center"
                        >
                            <RotateCcw class="text-red-500 ml-2 square-5" />
                        </button>
                    </Tooltip>
                {/if}
            </div>
            <div class="relative my-2">
                <div class="absolute h-10 inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search class="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <input bind:value={searchTerm} autocapitalize="off" autocomplete="off" autocorrect="off" class="bg-white dark:bg-dark text-sm rounded-lg block w-full h-10 pl-10 p-2.5 dark:placeholder:text-[#3b3b3b] focus:ring-blue-500 focus:border-blue-500" placeholder="Søg..." spellcheck="false" type="search" />
            </div>
            {#if $open}
                <div use:melt={$content} transition:slide>
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row space-x-2">
                            <Tab
                                on:click={() => {
                                    searchFilter = "All";
                                }}
                                selected={searchFilter == "All"}>Alle</Tab
                            >
                            <Tab
                                on:click={() => {
                                    searchFilter = "Received";
                                }}
                                selected={searchFilter == "Received"}>Modtaget</Tab
                            >
                            <Tab
                                on:click={() => {
                                    searchFilter = "Sent";
                                }}
                                selected={searchFilter == "Sent"}>Sendt</Tab
                            >
                        </div>
                        <div class="flex flex-row max-sm:justify-between">
                            <div class="mr-2">
                                <Datetime bind:value={searchFrom} />
                            </div>
                            <div class="flex items-center justify-center">
                                <Minus />
                            </div>
                            <div class="ml-2">
                                <Datetime bind:value={searchTo} />
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </header>
        <div class="h-full overflow-hidden p-4 space-y-4">
            <h3 class="mt-0">Beskeder</h3>
            <div class="h-full overflow-y-auto space-y-1">
                {#if !loading && students && messages}
                    {#if filteredMessages.length}
                        {#each filteredMessages as message}
                            <div
                                class="relative flex flex-row items-center p-4 cursor-pointer rounded-md hover:bg-light-hover dark:hover:bg-dark-hover {selectedMessage === message.id ? 'bg-light dark:bg-dark' : ''}"
                                on:click={() => {
                                    if (selectedMessage == message.id) return;
                                    dataMessage = undefined;
                                    fullMessage = undefined;
                                    selectedMessage = message.id;
                                }}
                                on:keydown={() => {}}
                            >
                                <div class="absolute text-xs text-gray-500 right-0 top-0 mr-4 mt-4">{message.date.toRelative()}</div>
                                <Avatar user={{ id: students.find((student) => student.name == message.sender)?.id ?? "123", name: message.sender }} />
                                <div class="flex flex-col flex-grow ml-3">
                                    <div class="text-sm font-medium">{message.sender}</div>
                                    <div class="text-xs truncate">{message.title}</div>
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="flex items-center justify-center">
                            <div class="flex flex-col">
                                Ingen resultater
                                {#if searchResetable}
                                    <Button
                                        on:click={() => {
                                            searchTerm = "";
                                            searchFilter = "All";
                                            searchFrom = "";
                                            searchTo = "";
                                        }}
                                        variant="destructive"
                                    >
                                        Nulstil filtre
                                    </Button>
                                {/if}
                            </div>
                        </div>
                    {/if}
                {:else}
                    <div class="relative flex flex-row items-center p-4">
                        <Skeleton class="absolute right-0 top-0 mr-4 mt-4 w-12 h-4" />
                        <Skeleton class="h-10 w-10 rounded-full" />
                        <div class="flex flex-col flex-grow ml-3 space-y-2">
                            <Skeleton class="w-24 h-6" />
                            <Skeleton class="w-24 h-4" />
                        </div>
                    </div>
                    <div class="relative flex flex-row items-center p-4">
                        <Skeleton class="absolute right-0 top-0 mr-4 mt-4 w-12 h-4" />
                        <Skeleton class="h-10 w-10 rounded-full" />
                        <div class="flex flex-col flex-grow ml-3 space-y-2">
                            <Skeleton class="w-24 h-6" />
                            <Skeleton class="w-24 h-4" />
                        </div>
                    </div>
                    <div class="relative flex flex-row items-center p-4">
                        <Skeleton class="absolute right-0 top-0 mr-4 mt-4 w-12 h-4" />
                        <Skeleton class="h-10 w-10 rounded-full" />
                        <div class="flex flex-col flex-grow ml-3 space-y-2">
                            <Skeleton class="w-24 h-6" />
                            <Skeleton class="w-24 h-4" />
                        </div>
                    </div>
                    <div class="relative flex flex-row items-center p-4">
                        <Skeleton class="absolute right-0 top-0 mr-4 mt-4 w-12 h-4" />
                        <Skeleton class="h-10 w-10 rounded-full" />
                        <div class="flex flex-col flex-grow ml-3 space-y-2">
                            <Skeleton class="w-24 h-6" />
                            <Skeleton class="w-24 h-4" />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
    {#if selectedMessage}
        <div class="flex flex-col w-full h-full space-y-4 border-l dark:border-white/10" transition:fly={{ duration: 1000, x: "100vw" }}>
            <section class="p-4 pb-0">
                <div class="bg-white dark:bg-dark shadow-lg rounded-md py-4 px-6 flex items-center justify-between">
                    {#if fullMessage}
                        <h2 class="my-0">{fullMessage.messages[0].title}</h2>
                        <div
                            class="cursor-pointer"
                            on:click={() => {
                                dataMessage = undefined;
                                fullMessage = undefined;
                                selectedMessage = undefined;
                            }}
                            on:keydown={() => {}}
                        >
                            <Plus class="rotate-45" />
                        </div>
                    {:else}
                        <Skeleton class="h-8 w-1/2" />
                    {/if}
                </div>
            </section>
            <section class="h-full overflow-y-hidden p-4 py-0 not-prose">
                <div class="h-full overflow-y-auto space-y-4">
                    {#if fullMessage}
                        {#each fullMessage.messages as message}
                            {#if message.sender.name === me?.name}
                                <div class="grid grid-cols-[1fr_auto] gap-2">
                                    <div class="rounded-md p-4 rounded-tr-none space-y-2 bg-[#c9fcd0] dark:bg-[#8778f983]">
                                        <header class="flex justify-between items-center">
                                            <p class="font-bold">{message.title}</p>
                                            <small class="opacity-50">{message.date.toRelative()}</small>
                                        </header>
                                        <div>
                                            {#if message.attachments.length}
                                                <div class="flex flex-col max-xl:space-y-2 xl:flex-row xl:space-x-2">
                                                    {#each message.attachments as attachment}
                                                        <Badge href={attachment.link}>{attachment.name}</Badge>
                                                    {/each}
                                                </div>
                                            {/if}
                                            <SvelteMarkdown source={message.body} />
                                        </div>
                                    </div>
                                    <Tooltip text={message.sender.name} class="w-10 h-10">
                                        <Avatar user={message.sender} />
                                    </Tooltip>
                                </div>
                            {:else}
                                <div class="grid grid-cols-[auto_1fr] gap-2">
                                    <Tooltip text={message.sender.name} class="w-10 h-10">
                                        <Avatar user={message.sender} />
                                    </Tooltip>
                                    <div class="rounded-md p-4 rounded-tl-none space-y-2 bg-white dark:bg-dark">
                                        <header class="flex justify-between items-center">
                                            <p class="font-bold">{message.title}</p>
                                            <small class="opacity-50">{message.date.toRelative()}</small>
                                        </header>
                                        <div>
                                            {#if message.attachments.length}
                                                <div class="flex flex-col max-xl:space-y-2 xl:flex-row xl:space-x-2">
                                                    {#each message.attachments as attachment}
                                                        <Badge href={attachment.link}>{attachment.name}</Badge>
                                                    {/each}
                                                </div>
                                            {/if}
                                            <SvelteMarkdown source={message.body} />
                                            {#if message.edits.length}
                                                {#each message.edits as edit}
                                                    <p class="text-sm text-gray-400">{edit}</p>
                                                {/each}
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {/if}
                </div>
            </section>
            <section class="w-full p-4 !mt-0">
                <div class="grid grid-cols-[1fr_auto] overflow-hidden rounded-md bg-white dark:bg-dark">
                    <textarea disabled class="bg-transparent border-0 ring-0 py-2 px-3" name="message" id="message" placeholder="Skriv en besked..." rows="1" />
                    <button class="flex items-center content-between px-4">
                        <Send />
                    </button>
                </div>
            </section>
        </div>
    {/if}
</div>
