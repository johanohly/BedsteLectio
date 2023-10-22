<script lang="ts">
    import flatpickr from "flatpickr";
    import type { Instance } from "flatpickr/dist/types/instance";
    import { onMount } from "svelte";

    export let value = "";
    let className = "";
    export { className as class };

    let input: HTMLInputElement;
    let trigger: HTMLButtonElement;
    let picker: Instance;
    onMount(() => {
        picker = flatpickr(input, {
            positionElement: trigger,
            dateFormat: "Z+02:00",
            formatDate(date, format, locale) {
                return flatpickr.formatDate(date, format).replace("Z", "");
            },
        });
    });
    $: if (value == "" && picker) picker.clear();
</script>

<input bind:this={input} type="text" placeholder="Vælg en dato..." class="hidden" bind:value />
<button class={className} bind:this={trigger} on:click={(e) => picker.open(e)} on:keydown={() => {}}><slot /></button>
