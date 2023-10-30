<script lang="ts">
    import { createDialog, melt } from "@melt-ui/svelte";
    import { isColorValid } from "./utils";
    import { flyAndScale } from "$lib/utils";
    import { fade } from "svelte/transition";
    import { X } from "lucide-svelte";

    export let color: string;

    let width = 0;
    let handle: HTMLDivElement;
    $: if (handle && isColorValid(color)) {
        handle.style.left = `${(+color / 360) * width}px`;
    }

    function handleClick(event: MouseEvent) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const hue = Math.round((x / width) * 360);
        color = `${hue}`;
    }

    const {
        elements: { trigger, overlay, content, title, description, close, portalled },
        states: { open },
    } = createDialog();
</script>

<button use:melt={$trigger} style={isColorValid(color) ? `background-color: hsl(${color}, 100%, 90%) !important` : ``} class="cursor-pointer w-full h-11 outline-none border bg-[inherit] dark:bg-[#2e2e2e] {isColorValid(color) ? '' : 'border-red-500'} rounded-[6px] p-2" />

<div use:melt={$portalled}>
    {#if $open}
        <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" transition:fade={{ duration: 150 }} />
        <div
            class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            dark:bg-dark p-6 shadow-lg"
            transition:flyAndScale={{
                duration: 150,
                y: 8,
                start: 0.96,
            }}
            use:melt={$content}
        >
            <h2 use:melt={$title} class="m-0 text-lg font-medium">Vælg farve</h2>
            <p use:melt={$description} class="mb-5 mt-2 leading-normal">For at farverne på skemaet er uniforme, kan man kun vælge farver i et meget bestemt spektrum.</p>

            <div class="space-y-4">
                <div
                    bind:clientWidth={width}
                    on:click={handleClick}
                    class="w-full h-11 rounded-[6px]"
                    style="background: -webkit-linear-gradient(left, hsla(0, 100%, 90%, 1),hsla(10, 100%, 90%, 1),hsla(20, 100%, 90%, 1),hsla(30, 100%, 90%, 1),hsla(40, 100%, 90%, 1),hsla(50, 100%, 90%, 1),hsla(60, 100%, 90%, 1),hsla(70, 100%, 90%, 1),hsla(80, 100%, 90%, 1),hsla(90, 100%, 90%, 1),hsla(100, 100%, 90%, 1),hsla(110, 100%, 90%, 1),hsla(120, 100%, 90%, 1),hsla(130, 100%, 90%, 1),hsla(140, 100%, 90%, 1),hsla(150, 100%, 90%, 1),hsla(160, 100%, 90%, 1),hsla(170, 100%, 90%, 1),hsla(180, 100%, 90%, 1),hsla(190, 100%, 90%, 1),hsla(200, 100%, 90%, 1),hsla(210, 100%, 90%, 1),hsla(220, 100%, 90%, 1),hsla(230, 100%, 90%, 1),hsla(240, 100%, 90%, 1),hsla(250, 100%, 90%, 1),hsla(260, 100%, 90%, 1),hsla(270, 100%, 90%, 1),hsla(280, 100%, 90%, 1),hsla(290, 100%, 90%, 1),hsla(300, 100%, 90%, 1),hsla(310, 100%, 90%, 1),hsla(320, 100%, 90%, 1),hsla(330, 100%, 90%, 1),hsla(340, 100%, 90%, 1),hsla(350, 100%, 90%, 1),hsla(360, 100%, 90%, 1));; background: -moz-linear-gradient(left, hsla(0, 100%, 90%, 1),hsla(10, 100%, 90%, 1),hsla(20, 100%, 90%, 1),hsla(30, 100%, 90%, 1),hsla(40, 100%, 90%, 1),hsla(50, 100%, 90%, 1),hsla(60, 100%, 90%, 1),hsla(70, 100%, 90%, 1),hsla(80, 100%, 90%, 1),hsla(90, 100%, 90%, 1),hsla(100, 100%, 90%, 1),hsla(110, 100%, 90%, 1),hsla(120, 100%, 90%, 1),hsla(130, 100%, 90%, 1),hsla(140, 100%, 90%, 1),hsla(150, 100%, 90%, 1),hsla(160, 100%, 90%, 1),hsla(170, 100%, 90%, 1),hsla(180, 100%, 90%, 1),hsla(190, 100%, 90%, 1),hsla(200, 100%, 90%, 1),hsla(210, 100%, 90%, 1),hsla(220, 100%, 90%, 1),hsla(230, 100%, 90%, 1),hsla(240, 100%, 90%, 1),hsla(250, 100%, 90%, 1),hsla(260, 100%, 90%, 1),hsla(270, 100%, 90%, 1),hsla(280, 100%, 90%, 1),hsla(290, 100%, 90%, 1),hsla(300, 100%, 90%, 1),hsla(310, 100%, 90%, 1),hsla(320, 100%, 90%, 1),hsla(330, 100%, 90%, 1),hsla(340, 100%, 90%, 1),hsla(350, 100%, 90%, 1),hsla(360, 100%, 90%, 1));"
                >
                    <div bind:this={handle} class="relative h-11 w-2 bg-dark dark:bg-white rounded-sm" />
                </div>

                <div class="flex flex-wrap -mx-2">
                    {#each [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as hue}
                        <div class="w-1/6 px-2 pb-4">
                            <div
                                class="h-12 rounded-[6px] cursor-pointer"
                                style={`background-color: hsl(${hue}, 100%, 90%)`}
                                on:click={() => {
                                    color = `${hue}`;
                                }}
                            />
                        </div>
                    {/each}
                </div>
            </div>

            <button
                use:melt={$close}
                aria-label="close"
                class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none
                items-center justify-center rounded-full p-1"
            >
                <X class="square-4" />
            </button>
        </div>
    {/if}
</div>
