<script lang="ts">
  import { cn } from "$lib/utils";

  export let selected: boolean = false;
  let className: string | undefined | null = undefined;
  export { className as class };
</script>

{#if selected}
  <span
    on:click
    on:keydown={() => {}}
    class={cn(
      "relative inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#030303] dark:bg-light px-[12px] py-1 text-base font-medium text-white dark:text-black",
      className
    )}
  >
    <slot />
  </span>
{:else}
  <span
    on:click
    on:keydown={() => {}}
    class={cn(
      "relative inline-flex cursor-pointer items-center justify-center rounded-lg bg-white hover:bg-[#f0f0f0] dark:bg-dark dark:hover:bg-dark-hover px-[12px] py-1 text-base font-medium text-black dark:text-white",
      className
    )}
  >
    <slot />
  </span>
{/if}
