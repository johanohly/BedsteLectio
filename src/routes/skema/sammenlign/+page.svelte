<script lang="ts">
  import { MultiRequestData, RequestData } from "$components";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { authStore } from "$lib/stores";
  import { flyAndScale } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { filter } from "fuzzy";
  import { ChevronsUpDown, X } from "lucide-svelte";

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

  let students: { name: string; id: string }[] | undefined = undefined;
  let dataStudents: { elever: { [key: string]: string } };
  $: if (dataStudents)
    students = Object.entries(dataStudents.elever ?? {}).map(([name, id]) => ({
      id,
      name,
    }));
  $: me = students?.find(
    (student) => student.id == `S${decodeUserID($authStore.cookie)}`
  );

  let selectedStudent: { name: string; id: string } | undefined = undefined;
  let searchTerm = "";
  $: filteredStudents = filter(
    searchTerm,
    students?.map((student) => student.name) ?? [],
    {
      post: "</strong>",
      pre: "<strong>",
    }
  ).slice(0, 10);

  $: if ($open) {
    setTimeout(() => {
      const input = document.getElementById("student-input");
      if (input) input.focus();
    }, 100);
  }

  //   let loadData = false;
  //   let data: { [key: string]: object } = {};
  //   $: info = data["informationer"] ?? {};
  //   $: frontpage = data["forside"] ?? {};
  //   $: console.log(info, frontpage);
</script>

<RequestData bind:data={dataStudents} path="informationer" />
<!-- {#key loadData}
  <MultiRequestData bind:data paths={[`informationer`, `forside`]} />
{/key} -->

{#if students}
  <div class="w-full flex p-4 bg-white rounded-md">
    <div class="w-full flex flex-col md:flex-row justify-evenly">
      <Button>{me?.name}</Button>
      <button
        use:melt={$trigger}
        class="h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-between rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ring-offset-background"
      >
        {selectedStudent ? selectedStudent.name : `Vælg student...`}
        <ChevronsUpDown class="square-5" />
      </button>
    </div>
  </div>
{:else}
  Loading
{/if}

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
      <h2 class="m-0 text-xl font-medium" use:melt={$title}>Vælg elev</h2>
      <p
        class="mb-5 mt-2 leading-normal text-muted-foreground"
        use:melt={$description}
      >
        Søg efter elever i søgefeltet nedenfor.
      </p>
      <Input id="student-input" bind:value={searchTerm} class="mb-5" />
      <div class="space-y-2">
        {#each filteredStudents as student}
          <button
            class="w-full rounded-md border border-slate-200 bg-neutral-50 text-slate-900 dark:border-slate-800 dark:bg-neutral-950 dark:text-slate-100 px-3
                  py-2 text-magnum-700 transition-opacity hover:opacity-90"
            on:click={() => {
              selectedStudent = students?.find((s) => s.name == student.string);
              // open.set(false);
            }}
            use:melt={$close}
          >
            {@html student.string.replaceAll("<Navnebeskyttet>", "Navnebeskyttet")}
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
