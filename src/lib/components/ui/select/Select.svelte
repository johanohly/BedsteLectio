<script lang="ts">
  import { createSelect, melt } from "@melt-ui/svelte";
  import { ChevronsUpDown } from "lucide-svelte";
  import { fly } from "svelte/transition";

  export let options: object;
  export let placeholder: string;
  export let value: string | number;

  const {
    elements: { trigger, menu, option },
    states: { value: rootValue, valueLabel, open },
  } = createSelect({
    forceVisible: true,
    defaultValue: value,
  });
  rootValue.subscribe((v) => {
    value = v;
  });
</script>

<div class="flex flex-col gap-1">
  <button
    class="flex h-12 min-w-[220px] items-center justify-between rounded-md border border-slate-200 bg-neutral-50 text-slate-900 dark:border-slate-800 dark:bg-neutral-950 dark:text-slate-100 px-3
    py-2 text-magnum-700 transition-opacity hover:opacity-90"
    use:melt={$trigger}
    {...$$restProps}
  >
    {$valueLabel || placeholder}
    <ChevronsUpDown class="square-5" />
  </button>
  {#if $open}
    <div
      class="z-10 flex max-h-[360px] flex-col
      overflow-y-auto rounded-md bg-neutral-50 text-slate-900 dark:bg-neutral-950 dark:text-slate-100
      p-1 focus:!ring-0"
      use:melt={$menu}
      transition:fly={{ duration: 100, y: -5 }}
    >
      {#each Object.entries(options) as [key, value]}
        <div
          class="relative cursor-pointer rounded-md py-1 pl-4 pr-4 text-slate-900 dark:text-slate-100
              focus:z-10 focus:text-primary-700
            data-[highlighted]:bg-[#e3ffe7] data-[selected]:bg-[#abfcb7]
            dark:data-[highlighted]:bg-[#8778f9be] dark:data-[selected]:bg-[#8678F9]"
          use:melt={$option({ value: value, label: key })}
        >
          {key}
        </div>
      {/each}
    </div>
  {/if}
</div>
