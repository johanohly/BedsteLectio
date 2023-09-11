<script lang="ts">
    import type { FullMessage, Message, RawFullMessage, RawMessage } from "$lib/types/messages";

    import { RequestData } from "$components";
    import { Avatar } from "$components/ui/avatar";
    import { Skeleton } from "$components/ui/skeleton";
    import { authStore } from "$lib/stores";
    import { decodeUserID } from "$lib/utilities/cookie";
    import { Send } from "lucide-svelte";
    import { DateTime } from "luxon";

    let students: { id: string; name: string }[] | undefined = undefined;
    let dataStudents: { elever: { [key: string]: string }; lærere: { [key: string]: string } };
    $: if (dataStudents) {
        students = Object.entries({ ...dataStudents.elever, ...dataStudents.lærere } ?? {}).map(([name, id]) => {
            const formatted = name.split(" (")[0];
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
                sender: message.førsteBesked.split(" (")[0],
                title: message.emne,
            };
        });
    }

    let selectedMessage: number | undefined = 61780835214;

    let loadingMessage = false;
    let dataMessage: RawFullMessage | undefined = undefined;
    let fullMessage: FullMessage | undefined = undefined;
    $: if (dataMessage && dataMessage.beskeder) {
        fullMessage = {
            messages: dataMessage.beskeder.map((message) => {
                return {
                    body: message.besked,
                    date: DateTime.fromFormat(message.dato, "d/M-yyyy HH:mm", {
                        locale: "da",
                    }),
                    sender: { id: message.bruger.id, name: message.bruger.navn.split(" (")[0] },
                    title: message.titel,
                };
            }),
            receivers: dataMessage.modtagere,
        };
    }
</script>

<RequestData bind:data={dataStudents} path="informationer" />
<RequestData bind:data bind:loading path="beskeder2" />
{#key selectedMessage}
    {#if selectedMessage}
        <RequestData bind:data={dataMessage} bind:loading={loadingMessage} path={`besked?id=${selectedMessage}`} />
    {/if}
{/key}

<div class="w-full h-full grid grid-cols-[30%_1fr]">
    <div class="grid grid-rows-[auto_1fr] border-r dark:border-white/10">
        <header class="border-b dark:border-white/10 p-4">
            <h3>Filtrér</h3>
            (wip)
        </header>
        <div class="p-4 space-y-4">
            <h3>Beskeder</h3>
            <div class="space-y-1 max-h-[70vh] overflow-y-auto">
                {#if !loading && students && messages}
                    {#each messages as message}
                        <div
                            class="relative flex flex-row items-center p-4 cursor-pointer rounded-md hover:bg-light-hover dark:hover:bg-dark-hover {selectedMessage === message.id ? 'bg-light dark:bg-dark' : ''}"
                            on:click={() => {
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
    <div class="grid grid-row-[auto_1fr_auto]">
        <section class="border-b dark:border-white/10 p-4">
            <h2>Besked titel (wip)</h2>
        </section>
        <section class="p-4 overflow-y-auto space-y-4 not-prose">
            {#if !loadingMessage && students}
                {#if fullMessage}
                    {#each fullMessage.messages as message}
                        {#if message.sender.name === me?.name}
                            <div class="grid grid-cols-[1fr_auto] gap-2">
                                <div class="rounded-md p-4 rounded-tr-none space-y-2 bg-[#c9fcd0] dark:bg-[#8778f983]">
                                    <header class="flex justify-between items-center">
                                        <p class="font-bold">{message.title}</p>
                                        <small class="opacity-50">{message.date.toRelative()}</small>
                                    </header>
                                    <p>{message.body}</p>
                                </div>
                                <Avatar user={message.sender} />
                            </div>
                        {:else}
                            <div class="grid grid-cols-[auto_1fr] gap-2">
                                <Avatar user={message.sender} />
                                <div class="rounded-md p-4 rounded-tl-none space-y-2 bg-white dark:bg-dark">
                                    <header class="flex justify-between items-center">
                                        <p class="font-bold">{message.title}</p>
                                        <small class="opacity-50">{message.date.toRelative()}</small>
                                    </header>
                                    <p>{message.body}</p>
                                </div>
                            </div>
                        {/if}
                    {/each}
                {:else}
                    <div class="text-center">Vælg en besked</div>
                {/if}
            {:else}
                <div class="text-center">Indlæser...</div>
            {/if}
        </section>
        <!-- <section class="border-t dark:border-white/10 p-4">
            <div class="input-group input-group-divider grid-cols-[1fr_auto] rounded-container-token">
                <textarea
                    bind:value={currentMessage}
                    class="bg-transparent border-0 ring-0"
                    name="message"
                    id="message"
                    placeholder="Skriv en besked..."
                    rows="1"
                    on:keydown={async () => {
                        if (["Enter"].includes(event.code)) {
                            event.preventDefault();
                            await sendMessage();
                        }
                    }}
                />
                <button class={currentMessage ? "" : "input-group-shim"} on:click={sendMessage}>
                    <Send />
                </button>
            </div>
        </section> -->
    </div>
</div>
