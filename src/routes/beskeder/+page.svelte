<script lang="ts">
    import type { FullMessage, Message, RawFullMessage, RawMessage } from "$lib/types/messages";

    import { RequestData } from "$components";
    import { Avatar } from "$components/ui/avatar";
    import { Badge } from "$components/ui/badge";
    import { Skeleton } from "$components/ui/skeleton";
    import { Tooltip } from "$components/ui/tooltip";
    import { authStore } from "$lib/stores";
    import { decodeUserID } from "$lib/utilities/cookie";
    import { ChevronDown, ChevronUp, ExternalLink, Minus, Pencil, Plus, RotateCcw, Search, Send } from "lucide-svelte";
    import { DateTime } from "luxon";
    import { fade, fly, slide } from "svelte/transition";
    import SvelteMarkdown from "svelte-markdown";
    import { createCollapsible, melt, type ComboboxOption } from "@melt-ui/svelte";
    import { test } from "fuzzy";
    import { Tab } from "$components/ui/tab";
    import { Datetime } from "$components/ui/datetime";
    import { Button } from "$components/ui/button";
    import { addToast } from "$components/toaster";
    import { Select } from "$components/ui/select";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import type { Writable } from "svelte/store";
    import { relativeTime } from "$lib/utilities";

    let students: { id: string; name: string }[] | undefined = undefined;
    let groups: string[] | undefined = undefined;
    let dataStudents: { elever: { [key: string]: string }; lærere: { [key: string]: string }; hold_og_grupper: { [key: string]: string } };
    $: if (dataStudents) {
        students = Object.entries({ ...dataStudents.elever, ...dataStudents.lærere } ?? {}).map(([name, id]) => {
            const formatted = name.split(" (")[0].split(" -")[0];
            return {
                id,
                name: formatted,
            };
        });
        groups = Object.entries(dataStudents.hold_og_grupper ?? {}).map(([name, id]) => name);
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
                id: message.message_id,
                receivers: message.modtagere,
                sender: message.førsteBesked.split(" (")[0].split(" -")[0],
                title: message.emne,
            };
        });
    }

    let searchTerm = "";
    let searchFilter: "All" | "Received" | "Sent" = "All";
    let searchGroup: Writable<ComboboxOption<unknown> | undefined>;
    let searchFrom = "";
    let searchTo = "";
    $: searchResetable = searchTerm != "" || searchFilter != "All" || searchFrom != "" || searchTo != "" || (typeof $searchGroup !== "undefined" && !Array.isArray($searchGroup) && $searchGroup.label);
    $: filteredMessages = messages
        ? messages.filter((message) => {
              if (searchFilter != "All") {
                  if (message.sender == me?.name && searchFilter == "Received") return false;
                  if (message.sender != me?.name && searchFilter == "Sent") return false;
              }
              if ($searchGroup && $searchGroup.label) {
                  if (!message.receivers.includes($searchGroup.label)) return false;
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

    let selectedMessage: string | undefined = undefined;
    onMount(() => {
        const params = $page.url.searchParams;
        const messageId = params.get("id");
        if (messageId !== null && messageId != selectedMessage) {
            selectedMessage = messageId;
            return goto(`/beskeder`);
        }
    });
    $: if (selectedMessage && messageError.error) {
        selectedMessage = undefined;
    }

    let messageError = { error: false, active: true, path: "/beskeder", toast: { title: "Beskeden findes ikke", description: "Den angivne besked kunne ikke findes, alle beskeder vises.", color: "bg-red-500" } };
    let dataMessage: RawFullMessage | undefined = undefined;
    let fullMessage: FullMessage | undefined = undefined;
    let messageLoading: boolean;
    $: if (dataMessage && dataMessage.beskeder) {
        fullMessage = {
            messages: dataMessage.beskeder.map((message) => {
                const edits = message.besked.match(/^.*Redigeret af.*$/gm) ?? [];
                const clientParts = message.besked.match(/Sendt fra.*\[(.*)\]\((.*)\)|\[Sendt fra (.*)\]\((.*)\)/);
                const client = clientParts
                    ? {
                          name: clientParts[1] ?? clientParts[3],
                          link: clientParts[2] ?? clientParts[4],
                      }
                    : undefined;

                return {
                    attachments: message.vedhæftninger
                        ? message.vedhæftninger.map((attachment) => {
                              return {
                                  link: attachment.href,
                                  name: attachment.navn,
                              };
                          })
                        : [],
                    date: DateTime.fromFormat(message.dato, "dd-MM-yyyy HH:mm:ss", {
                        locale: "da",
                    }),
                    edits,
                    client,
                    body: message.besked
                        .replaceAll("@", "@<!-- -->")
                        .replaceAll(/^.*Redigeret af.*$/gm, "")
                        .replace(/Sendt fra.*\[(.*)\]\((.*)\)|\[Sendt fra (.*)\]\((.*)\)/, ""),
                    sender: { id: message.bruger.id, name: message.bruger.navn.split(" (")[0].split(" -")[0] },
                    title: message.titel,
                    id: message.id,
                    indent: message.padding_left,
                };
            }),
            receivers: dataMessage.modtagere,
        };
    }

    let replyTo: FullMessage["messages"][0] | undefined = undefined;
    let replyContent = "";
    const sendReply = async () => {
        if (!fullMessage) return;
        if (!replyTo) return;
        if (!replyContent) return;
        const res = await fetch("https://api.betterlectio.dk/besvar_besked", {
            method: "POST",
            headers: {
                "lectio-cookie": $authStore.cookie,
            },
            body: JSON.stringify({
                message_id: fullMessage.messages[0].id.replace("ANSWERMESSAGE_", ""),
                id: replyTo.id,
                titel: replyTo.title.includes("Re: ") ? replyTo.title : `Re: ${replyTo.title}`,
                content: replyContent,
            }),
        });
        if (res.status == 200) {
            addToast({
                data: {
                    title: "Besked sendt",
                    description: "Din besked blev sendt.",
                    color: "bg-green-500",
                },
            });
            selectedMessage = selectedMessage + " ";
        } else {
            addToast({
                data: {
                    title: "Besked ikke sendt",
                    description: "Din besked kunne ikke blive sendt. Prøv igen senere.",
                    color: "bg-red-500",
                },
            });
        }
        replyTo = undefined;
        replyContent = "";
    };
    const onWindowKeydown = (event: KeyboardEvent) => {
        if (event.key == "Escape") {
            if (replyTo) {
                replyTo = undefined;
            }
        }
    };
    const maybeReply = async (event: KeyboardEvent) => {
        if (event.key == "Enter") {
            await sendReply();
        }
    };

    const {
        elements: { root, content, trigger },
        states: { open },
    } = createCollapsible();

    let container: HTMLDivElement;
    let height = 0;
    $: if (height > 0) {
        container.style.height = `${height - 57}px`;
    }

    const removeAllOccurences = (element: Element, className: string | string[]) => {
        if (Array.isArray(className)) {
            className.forEach((name) => {
                if (element.classList.contains(name)) {
                    element.classList.remove(name);
                }
            });
        } else {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            }
        }
    };
    const addIfMissing = (element: Element, className: string | string[]) => {
        if (Array.isArray(className)) {
            className.forEach((name) => {
                if (!element.classList.contains(name)) {
                    element.classList.add(name);
                }
            });
        } else {
            if (!element.classList.contains(className)) {
                element.classList.add(className);
            }
        }
    };
    let sidebar: HTMLDivElement;
    $: if (container && sidebar) {
        if (selectedMessage) {
            removeAllOccurences(container, ["lg:container", "lg:mx-auto", "lg:!pt-0"]);
            removeAllOccurences(sidebar, "w-full");
            addIfMissing(sidebar, ["hidden", "lg:w-1/3", "xl:w-[40rem]", "2xl:w-[60rem]"]);
        } else {
            setTimeout(() => {
                addIfMissing(container, ["lg:container", "lg:mx-auto", "lg:!pt-0"]);
                removeAllOccurences(sidebar, ["hidden", "lg:w-1/3", "xl:w-[40rem]", "2xl:w-[60rem]"]);
                addIfMissing(sidebar, "w-full");
            }, 1000);
        }
    }

    let width = 0;
    function flyOrFade(node: Element) {
        return width > 1024 ? fly(node, { duration: 1000, x: "100vw" }) : fade(node, { duration: 1000 });
    }
</script>

<RequestData bind:data={dataStudents} path="informationer" />
<RequestData bind:data bind:loading path="beskeder2" />
{#key selectedMessage}
    {#if selectedMessage}
        <RequestData bind:data={dataMessage} bind:loading={messageLoading} bind:onServerError={messageError} path={`besked?id=${selectedMessage}`} />
    {/if}
{/key}

<svelte:window on:keydown={onWindowKeydown} bind:innerWidth={width} bind:innerHeight={height} />

<div bind:this={container} class="lg:container lg:mx-auto lg:!pt-0 w-full flex flex-col lg:flex-row">
    <div bind:this={sidebar} style="transition: width 1000ms ease;" class="w-full lg:flex flex-col">
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
                                searchGroup.set(undefined);
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
                                <Datetime bind:value={searchFrom} purpose="fra" />
                            </div>
                            <div class="flex items-center justify-center">
                                <Minus />
                            </div>
                            <div class="ml-2">
                                <Datetime bind:value={searchTo} purpose="til" />
                            </div>
                        </div>
                        <Select bind:value={searchGroup} items={groups} placeholder="Vælg gruppe eller hold" />
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
                                    replyTo = undefined;
                                    replyContent = "";
                                    selectedMessage = message.id;
                                }}
                                on:keydown={() => {}}
                            >
                                <div use:relativeTime={message.date.toJSDate()} class="absolute text-xs text-gray-500 right-0 top-0 mr-4 mt-4" />
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
                                            searchGroup.set(undefined);
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
        <div class="flex flex-col w-full h-full space-y-4 border-l dark:border-white/10" transition:flyOrFade>
            <section class="p-4 pb-0">
                <div class="bg-white dark:bg-dark shadow-lg rounded-md py-4 px-6 flex items-center">
                    {#if fullMessage}
                        <Avatar user={fullMessage.messages[0].sender} />
                        <div class="flex flex-col ml-3">
                            <span class="font-semibold leading-5">{fullMessage.messages[0].title}</span>
                            <Tooltip text={fullMessage.receivers}>
                                <span class="block max-w-[14rem] md:max-w-lg lg:max-w-xl text-xs text-gray-400 truncate">Modtagere: {fullMessage.receivers}</span>
                            </Tooltip>
                        </div>
                        <div class="ml-auto">
                            <div
                                class="flex items-center justify-center bg-gray-100 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-400 text-gray-500 dark:text-gray-100 rounded-full h-10 w-10 cursor-pointer"
                                on:click={() => {
                                    dataMessage = undefined;
                                    fullMessage = undefined;
                                    selectedMessage = undefined;
                                    replyTo = undefined;
                                    replyContent = "";
                                }}
                                on:keydown={() => {}}
                            >
                                <Plus class="rotate-45" />
                            </div>
                        </div>
                    {:else}
                        <Skeleton class="h-10 w-10 rounded-full" />
                        <Skeleton class="h-10 w-1/2 ml-3" />
                    {/if}
                </div>
            </section>
            <section class="h-full overflow-y-hidden p-4 py-0 not-prose">
                <div class="h-full overflow-y-auto space-y-4">
                    {#if fullMessage}
                        {#each fullMessage.messages as message}
                            {#if message.sender.name === me?.name}
                                <div style={`margin-left: calc(3rem + ${message.indent}rem);`} class="grid grid-cols-[1fr_auto] gap-2">
                                    <!-- 3 rem = 0.5 rem for gap-2 + 2.5 rem for missing avatar -->
                                    <div
                                        on:click={() => {
                                            replyTo = message;
                                        }}
                                        on:keydown={() => {}}
                                        class="hover:brightness-95 dark:hover:opacity-90 rounded-md p-4 space-y-2 rounded-tr-none bg-[#c9fcd0] dark:bg-[#8778f983]"
                                    >
                                        <header class="flex flex-col md:flex-row md:items-center justify-between">
                                            <p class="font-bold">{message.title}</p>
                                            <small class="opacity-50" use:relativeTime={message.date.toJSDate()} />
                                        </header>
                                        <div>
                                            {#if message.attachments.length}
                                                <div class="flex flex-wrap flex-row">
                                                    {#each message.attachments as attachment}
                                                        <Badge class="mr-1 mb-1" href={attachment.link}>{attachment.name}</Badge>
                                                    {/each}
                                                </div>
                                            {/if}
                                            <SvelteMarkdown source={message.body} />
                                            {#if message.edits.length}
                                                {#each message.edits as edit}
                                                    <div class="flex items-center text-gray-400">
                                                        <p class="text-sm">{edit}</p>
                                                        <Pencil class="ml-1 h-4 w-4" />
                                                    </div>
                                                {/each}
                                            {/if}
                                            {#if message.client}
                                                <div class="flex items-center text-gray-400">
                                                    <a target="_blank" href={message.client.link} class="text-sm">Sendt fra {message.client.name}</a>
                                                    <ExternalLink class="ml-1 h-4 w-4" />
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                    <Tooltip text={message.sender.name} class="w-10 h-10">
                                        <Avatar user={message.sender} />
                                    </Tooltip>
                                </div>
                            {:else}
                                <div style={`margin-left: ${message.indent}rem;`} class="grid grid-cols-[auto_1fr] gap-2">
                                    <Tooltip text={message.sender.name} class="w-10 h-10">
                                        <Avatar user={message.sender} />
                                    </Tooltip>
                                    <div
                                        on:click={() => {
                                            replyTo = message;
                                        }}
                                        on:keydown={() => {}}
                                        class="hover:brightness-95 dark:hover:opacity-90 rounded-md p-4 space-y-2 rounded-tl-none bg-white dark:bg-dark"
                                    >
                                        <header class="flex flex-col md:flex-row md:items-center justify-between">
                                            <p class="font-bold">{message.title}</p>
                                            <small class="opacity-50" use:relativeTime={message.date.toJSDate()} />
                                        </header>
                                        <div>
                                            {#if message.attachments.length}
                                                <div class="flex flex-wrap flex-row">
                                                    {#each message.attachments as attachment}
                                                        <Badge class="mr-1 mb-1" href={attachment.link}>{attachment.name}</Badge>
                                                    {/each}
                                                </div>
                                            {/if}
                                            <SvelteMarkdown source={message.body} />
                                            {#if message.edits.length}
                                                {#each message.edits as edit}
                                                    <div class="flex items-center text-gray-400">
                                                        <p class="text-sm">{edit}</p>
                                                        <Pencil class="ml-1 h-4 w-4" />
                                                    </div>
                                                {/each}
                                            {/if}
                                            {#if message.client}
                                                <div class="flex items-center text-gray-400">
                                                    <a target="_blank" href={message.client.link} class="text-sm">Sendt fra {message.client.name}</a>
                                                    <ExternalLink class="ml-1 h-4 w-4" />
                                                </div>
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
                {#if replyTo}
                    <div class="bg-lighter dark:bg-darker px-3 py-1 rounded-t-lg flex flex-row items-center justify-between not-prose">
                        <p class="text-sm">Svarer <span class="font-bold">{replyTo.sender.name}</span></p>
                        <button
                            on:click={() => {
                                replyTo = undefined;
                                replyContent = "";
                            }}
                            class="flex items-center justify-center"
                        >
                            <Plus class="rotate-45" />
                        </button>
                    </div>
                {/if}
                <div class="grid grid-cols-[1fr_auto] overflow-hidden rounded-md {replyTo ? 'rounded-t-none' : ''} bg-white dark:bg-dark">
                    <input bind:value={replyContent} on:keydown={maybeReply} disabled={!fullMessage || !replyTo} class="bg-transparent border-0 ring-0 leading-5 py-3 px-3 disabled:cursor-not-allowed" name="message" id="message" placeholder={replyTo ? "Skriv din besked..." : "Vælg en besked..."} />
                    <button disabled={!fullMessage || !replyTo} on:click={sendReply} class="flex items-center content-between px-4 hover:bg-light-hover dark:hover:bg-dark-hover disabled:cursor-not-allowed">
                        <Send />
                    </button>
                </div>
            </section>
        </div>
    {/if}
</div>
