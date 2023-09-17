<script lang="ts">
    import flatpickr from "flatpickr";
    import type { Instance } from "flatpickr/dist/types/instance";
    import { onMount } from "svelte";

    export let value = "";
    export let purpose = "en";

    let input: HTMLInputElement;
    let picker: Instance;
    onMount(() => {
        picker = flatpickr(input, {
            dateFormat: "Z+02:00",
            maxDate: "today",
            disableMobile: true,
            altInput: true,
            altFormat: "d.m.y",
            formatDate(date, format, locale) {
                return flatpickr.formatDate(date, format).replace("Z", "");
            },
        });
    });
    $: if (value == "" && picker) picker.clear()
</script>

<input bind:this={input} type="text" placeholder="Vælg {purpose} dato..." class="bg-white dark:bg-dark rounded-lg h-10 p-2 max-w-[10rem]" bind:value />
