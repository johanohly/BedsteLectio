<script lang="ts">
  import { createDialog, melt } from "@melt-ui/svelte";
  import { ChevronsUpDown, X } from "lucide-svelte";
  import { filter } from "fuzzy";

  import { flyAndScale } from "./transition";
  import Input from "../input/Input.svelte";

  const {
    elements: {
      close,
      content,
      description,
      overlay,
      portalled,
      title,
      trigger,
    },
    states: { open },
  } = createDialog();

  export let schools: { [k: string]: number } = {};
  export let value = 0;
  $: valueKey = Object.keys(schools).find((key) => schools[key] === value);
  $: if ($open) {
    setTimeout(() => {
      const input = document.getElementById("school-select-input");
      if (input) input.focus();
    }, 100);
  }

  let searchTerm = "";
  $: filteredSchools = filter(searchTerm, Object.keys(schools), {
    post: "</strong>",
    pre: "<strong>",
  }).slice(0, 10);
</script>

<button
  class="flex h-12 min-w-[220px] items-center justify-between rounded-md border border-slate-200 bg-neutral-50 text-slate-900 dark:border-slate-800 dark:bg-neutral-950 dark:text-slate-100 px-3
    py-2 text-magnum-700 transition-opacity hover:opacity-90"
  use:melt={$trigger}
>
  {#if value > 0}{valueKey}{:else}Vælg din skole{/if}
  <ChevronsUpDown class="square-5" />
</button>

<div use:melt={$portalled}>
  {#if $open}
    <div class="fixed inset-0 z-50 bg-background/50" use:melt={$overlay} />
    <div
      class="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background
            p-6 shadow-lg"
      transition:flyAndScale={{
        duration: 150,
        start: 0.96,
        y: 8,
      }}
      use:melt={$content}
    >
      <h2 class="m-0 text-xl font-medium" use:melt={$title}>Vælg Skole</h2>
      <p
        class="mb-5 mt-2 leading-normal text-muted-foreground"
        use:melt={$description}
      >
        Søg efter din skole i søgefeltet nedenfor.
      </p>
      <Input id="school-select-input" bind:value={searchTerm} class="mb-5" />
      <div class="space-y-2">
        {#each filteredSchools as school}
          <button
            class="w-full rounded-md border border-slate-200 bg-neutral-50 text-slate-900 dark:border-slate-800 dark:bg-neutral-950 dark:text-slate-100 px-3
                py-2 text-magnum-700 transition-opacity hover:opacity-90"
            on:click={() => {
              value = schools[school.original];
              // open.set(false);
            }}
            use:melt={$close}
          >
            {@html school.string}
          </button>
        {/each}
      </div>
      <button
        class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none
                items-center justify-center rounded-full p-1 text-foreground
                hover:bg-light-hover/60 dark:hover:bg-dark-hover/60"
        aria-label="close"
        use:melt={$close}
      >
        <X class="square-4" />
      </button>
    </div>
  {/if}
</div>
