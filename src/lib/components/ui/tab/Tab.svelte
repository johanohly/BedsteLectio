<script lang="ts">
  import { cn } from "$lib/utils";

  export let selected = false;
  let className: undefined | string | null = undefined;
  export { className as class };
</script>

{#if selected}
  <span
    class={cn(
      "relative inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#030303] dark:bg-light px-[12px] py-1 text-base font-medium text-white dark:text-black",
      className
    )}
    on:keydown={() => {}}
    on:click
  >
    <slot />
  </span>
{:else}
  <span
    class={cn(
      "relative inline-flex cursor-pointer items-center justify-center rounded-lg bg-white hover:bg-[#f0f0f0] dark:bg-dark dark:hover:bg-dark-hover px-[12px] py-1 text-base font-medium text-black dark:text-white",
      className
    )}
    on:keydown={() => {}}
    on:click
  >
    <slot />
  </span>
{/if}
