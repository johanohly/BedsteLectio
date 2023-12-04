<script lang="ts">
    import { createSlider, melt } from "@melt-ui/svelte";

    export let value = 0;
    export let min = 0;
    export let max = 100;
    const {
        elements: { root, range, thumb },
        states: { value: state },
    } = createSlider({
        defaultValue: [value],
        min,
        max,
        step: 1,
    });
    $: if ($state[0] !== value) value = $state[0];
</script>

<span use:melt={$root} class="relative flex h-[20px] w-full items-center">
    <span class="block h-[3px] w-full bg-black/40 dark:bg-dark-hover">
        <span use:melt={$range} class="h-[3px] bg-dark dark:bg-white" />
    </span>
    <span use:melt={$thumb()} class="block h-5 w-5 rounded-full bg-dark dark:bg-white focus:ring-4" />
</span>
