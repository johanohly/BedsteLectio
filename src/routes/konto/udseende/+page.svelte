<script lang="ts">
    import { RequestData } from "$components";
    import { addToast } from "$components/toaster";
    import { Select } from "$components/ui/assignableselect";
    import { authStore } from "$lib/stores";
    import { Loader2, X } from "lucide-svelte";

    let loading = true;
    let data: { hold_og_grupper: { [key: string]: string }[] };
    let classes: { [key: string]: string }[];
    $: if (!loading && data) {
        classes = data.hold_og_grupper;
    }

    let settings: { customColors: { [key: string]: string } } | undefined;
    let customColors: { class: string; color: string }[] = [];
    $: if (!loading && !customColors.length) {
        if (settings == undefined) {
            addToast({
                data: {
                    title: "Fejl",
                    description: "Der skete en fejl. Indstillinger kan ikke ændres for tiden.",
                    color: "bg-red-500",
                },
            });
        } else {
            customColors = settings.customColors ? Object.entries(settings.customColors).map(([key, value]) => ({ class: key, color: value })) : [];
        }
    }

    const isColorValid = (color: string) => {
        if (!color) return false;

        const number = +color;
        if (isNaN(number) || number < 0 || number > 360) return false;
        return true;
    };
    $: validColors = customColors.every((entry) => entry.class != "" && isColorValid(entry.color));

    let submittingColors = false;
    const submitColors = async () => {
        submittingColors = true;
        const response = await fetch("/api/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "lectio-cookie": $authStore.cookie,
            },
            body: JSON.stringify({
                custom_colors: Object.fromEntries(customColors.map((entry) => [entry.class, entry.color])),
            }),
        });
        submittingColors = false;
        if (!response.ok) {
            if (settings) customColors = settings.customColors ? Object.entries(settings.customColors).map(([key, value]) => ({ class: key, color: value })) : [];
            addToast({
                data: {
                    title: "Fejl",
                    description: "Der skete en fejl. Indstillinger kunne ikke gemmes.",
                    color: "bg-red-500",
                },
            });
        } else {
            addToast({
                data: {
                    title: "Succes",
                    description: "Indstillinger blev gemt.",
                    color: "bg-green-500",
                },
            });
        }
    };
</script>

<RequestData bind:loading bind:data bind:settings path="informationer" withSettings />

<section>
    <h2 class="mt-0">Udseende</h2>
    <p>Her kan du se og redigere BedsteLectio's udseende.</p>
    <div class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400">
        <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
            <h4 class="mt-0">Hold Farver</h4>
            <p class="text-sm">Her kan du manuelt ændre farverne af holdene på skemaet, for eksempel.</p>
            {#if loading || !classes}
                <Loader2 class="animate-spin w-6 h-6 text-gray-500" />
            {:else if settings == undefined}
                <p class="text-gray-500">Der skete en fejl. Indstillinger kan ikke ændres for tiden.</p>
            {:else}
                <div class="space-y-2">
                    {#each customColors as color}
                        <div class="flex space-x-2">
                            <div class="w-full flex space-x-2">
                                <Select bind:value={color.class} items={Object.keys(classes)} placeholder="Vælg hold..." />
                                <input type="number" min="0" max="360" bind:value={color.color} class="w-full h-11 outline-none border {isColorValid(color.color) ? 'dark:border-gray-600 border-gray-400' : 'border-red-500'} rounded-[6px] p-2 bg-[inherit] dark:bg-[#2e2e2e]" placeholder="Indsæt farve..." />
                            </div>
                            <button
                                on:click={() => {
                                    customColors = customColors.filter((entry) => entry != color);
                                }}
                                class="flex items-center justify-center h-11 w-11 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black"><X /></button
                            >
                        </div>
                    {/each}
                    <button
                        on:click={() => {
                            customColors.push({ class: "", color: "" });
                            customColors = customColors;
                        }}
                        class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black">Tilføj</button
                    >
                </div>
            {/if}
        </div>
        <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
            <p class="my-0 text-gray-500">Farver bliver representeret som lysstyrke i HSL farvesystemet.</p>
            <div class="flex items-center justify-end ml-auto">
                <button on:click={submitColors} disabled={loading || settings == undefined || !validColors || submittingColors} class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed">Gem</button>
            </div>
        </footer>
    </div>
</section>
