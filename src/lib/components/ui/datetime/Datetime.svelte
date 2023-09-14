<script lang="ts">
    import flatpickr from "flatpickr";
    import { onMount } from "svelte";

    export let value = "";
    export let id: string;

    let input: HTMLInputElement;
    onMount(() => {
        flatpickr(input, {
            enableTime: true,
            dateFormat: "Z+02:00",
            time_24hr: true,
            maxDate: "today",
            altInput: true,
            altFormat: "j. F Y H:i",
            formatDate(date, format, locale) {
                return flatpickr.formatDate(date, format).replace("Z", "");
            },
        });
    });
</script>

<input bind:this={input} {id} type="text" class="bg-white dark:bg-dark rounded-lg h-10 p-2" bind:value />
