<script lang="ts">
    import { RequestData } from "$components";
    import { addToast } from "$components/toaster";
    import { Select } from "$components/ui/assignableselect";
    import { test } from "fuzzy";
    import { Loader2 } from "lucide-svelte";

    const HEX_REGEX = /^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/;

    let loading = true;
    let data: { hold_og_grupper: { [key: string]: string }[] };
    let classes: { [key: string]: string }[];
    $: if (!loading && data) {
        classes = data.hold_og_grupper;
    }

    let settings: { custom_colors: { [key: string]: string } } | undefined;
    let customColors: { class: string; color: string }[] = [];
    $: if (!loading && !customColors) {
        console.log(settings);
        if (settings == undefined) {
            addToast({
                data: {
                    title: "Fejl",
                    description: "Der skete en fejl. Indstillinger kan ikke ændres for tiden.",
                    color: "bg-red-500",
                },
            });
        } else {
            customColors = settings.custom_colors ? Object.entries(settings.custom_colors).map(([key, value]) => ({ class: key, color: value })) : [];
        }
    }

    $: validColors = customColors.every((color) => color.class != "" && color.color.match(HEX_REGEX));
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
                            <Select bind:value={color.class} items={Object.keys(classes)} placeholder="Vælg hold..." />
                            <input
                                bind:value={color.color}
                                class="w-full mt-2 outline-none border {color.color.match(HEX_REGEX) ? "dark:border-gray-600 border-gray-400" : "border-red-500"} rounded-[6px] p-2 bg-[inherit] dark:bg-[#2e2e2e]"
                                placeholder="Indsæt farve..."
                                type="text"
                            />
                        </div>
                    {/each}
                    <button
                        on:click={() => {
                            customColors.push({ class: "", color: "" });
                            customColors = customColors;
                            console.log(customColors);
                        }}
                        class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black">Tilføj</button
                    >
                </div>
            {/if}
        </div>
        <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
            <p class="my-0 text-gray-500">Farver bliver representeret som hex koder.</p>
            <div class="flex items-center justify-end ml-auto">
                <button disabled={loading || settings == undefined || !validColors} class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed">Gem</button>
            </div>
        </footer>
    </div>
</section>
