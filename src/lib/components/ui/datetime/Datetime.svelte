<script lang="ts">
    import flatpickr from "flatpickr";
    import type { Instance } from "flatpickr/dist/types/instance";
    import { onMount } from "svelte";

    export let value = "";

    let input: HTMLInputElement;
    let picker: Instance;
    onMount(() => {
        picker = flatpickr(input, {
            enableTime: true,
            dateFormat: "Z+02:00",
            time_24hr: true,
            maxDate: "today",
            altInput: true,
            altFormat: "d.m.y H:i",
            formatDate(date, format, locale) {
                return flatpickr.formatDate(date, format).replace("Z", "");
            },
        });
    });
    $: if (value == "" && picker) picker.clear()
</script>

<input bind:this={input} type="text" placeholder="Vælg en dato..." class="bg-white dark:bg-dark rounded-lg h-10 p-2 max-w-[10rem]" bind:value />
