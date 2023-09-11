<script lang="ts">
  import type { RawLesson } from "$lib/types/lesson";

  import { MultiRequestData, RequestData } from "$components";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { authStore } from "$lib/stores";
  import { constructInterval, flyAndScale, notEmpty } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { filter } from "fuzzy";
  import { Check, ChevronsUpDown, Plus, X } from "lucide-svelte";
  import { DateTime } from "luxon";

  const {
    elements: { close, content, description, overlay, portalled, title, trigger },
    states: { open },
  } = createDialog();

  let students: { id: string; name: string }[] | undefined = undefined;
  let dataStudents: { elever: { [key: string]: string } };
  $: if (dataStudents)
    students = Object.entries(dataStudents.elever ?? {}).map(([name, id]) => ({
      id,
      name,
    }));
  $: me = students?.find((student) => student.id == `S${decodeUserID($authStore.cookie)}`);

  let selectedStudent: { id: string; name: string } | undefined = undefined;
  let searchTerm = "";
  $: filteredStudents = filter(searchTerm, students?.map((student) => student.name) ?? [], {
    post: "</strong>",
    pre: "<strong>",
  }).slice(0, 10);

  $: if ($open) {
    setTimeout(() => {
      const input = document.getElementById("student-input");
      if (input) input.focus();
    }, 100);
  }

  let results: {
    [key: string]: {
      leave: { me: string; same: boolean; student: string };
      meet: { me: string; same: boolean; student: string };
    };
  } = {};
  let data: { [key: string]: { moduler: RawLesson[]; ugeDage: string[] } } = {};
  $: meData = me ? data[`skema?id=${me.id}`] : undefined;
  $: studentData = selectedStudent ? data[`skema?id=${selectedStudent.id}`] : undefined;
  $: if (meData && studentData) {
    const meIntervals = meData.moduler.map((modul) => constructInterval(modul.tidspunkt));
    const studentIntervals = studentData.moduler.map((modul) => constructInterval(modul.tidspunkt));
    for (const rawDay of meData.ugeDage) {
      const [monthDay, month] = rawDay.replaceAll(/\(|\)/gm, "").split(" ")[1].split("/");
      const day = DateTime.local().set({ day: +monthDay, month: +month });
      const meMeetDates = meIntervals
        .map((interval) => interval.start)
        .filter(notEmpty)
        .filter((date) => date.hasSame(day, "day"))
        .sort((a, b) => a?.toMillis() - b?.toMillis());
      const meMeetDate = meMeetDates.length ? meMeetDates[0].toLocaleString(DateTime.TIME_24_SIMPLE) : "Ingen moduler";
      const studentMeetDates = studentIntervals
        .map((interval) => interval.start)
        .filter(notEmpty)
        .filter((date) => date.hasSame(day, "day"))
        .sort((a, b) => a?.toMillis() - b?.toMillis());
      const studentMeetDate = studentMeetDates.length ? studentMeetDates[0].toLocaleString(DateTime.TIME_24_SIMPLE) : "Ingen moduler";
      const meLeaveDates = meIntervals
        .map((interval) => interval.end)
        .filter(notEmpty)
        .filter((date) => date.hasSame(day, "day"))
        .sort((a, b) => a?.toMillis() - b?.toMillis());
      const meLeaveDate = meLeaveDates.length ? meLeaveDates[meLeaveDates.length - 1].toLocaleString(DateTime.TIME_24_SIMPLE) : "Ingen moduler";
      const studentLeaveDates = studentIntervals
        .map((interval) => interval.end)
        .filter(notEmpty)
        .filter((date) => date.hasSame(day, "day"))
        .sort((a, b) => a?.toMillis() - b?.toMillis());
      const studentLeaveDate = studentLeaveDates.length ? studentLeaveDates[studentLeaveDates.length - 1].toLocaleString(DateTime.TIME_24_SIMPLE) : "Ingen moduler";

      results[rawDay] = {
        leave: {
          me: `${me?.name.split(" (")[0]}: ${meLeaveDate}`,
          same: meLeaveDate == studentLeaveDate,
          student: `${selectedStudent?.name.split(" (")[0]}: ${studentLeaveDate}`,
        },
        meet: {
          me: `${me?.name.split(" (")[0]}: ${meMeetDate}`,
          same: meMeetDate == studentMeetDate,
          student: `${selectedStudent?.name.split(" (")[0]}: ${studentMeetDate}`,
        },
      };
    }
  }
</script>

<RequestData bind:data={dataStudents} path="informationer" />
{#key selectedStudent}
  {#if me && selectedStudent}
    <MultiRequestData bind:data paths={[`skema?id=${me.id}`, `skema?id=${selectedStudent.id}`]} />
  {/if}
{/key}

<div class="page-container">
  <div class="w-full flex flex-col p-4 bg-white dark:bg-dark rounded-md">
    <div class="w-full flex flex-col md:flex-row justify-evenly max-md:space-y-4">
      <Button>{me?.name ?? "Loading..."}</Button>
      <button class="h-10 py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-between rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ring-offset-background" disabled={!students} use:melt={$trigger}>
        {selectedStudent ? selectedStudent.name : `Vælg student`}
        <ChevronsUpDown class="ml-2 square-5" />
      </button>
    </div>
  </div>
  {#if results != {}}
    <div class="w-full flex flex-col md:flex-row justify-between max-md:space-y-4 md:space-x-4">
      {#each Object.entries(results) as [weekday, result]}
        <div class="w-full flex flex-col p-4 bg-white dark:bg-dark rounded-md">
          <h2 class="m-0">{weekday}</h2>
          <div class="flex items-center">
            <h3 class="m-0">Mødes</h3>
            {#if result.meet.same}<Check class="square-6" />{:else}<Plus class="square-6 rotate-45" />{/if}
          </div>
          <p>
            {result.meet.me}
            <br />
            {result.meet.student}
          </p>
          <div class="flex items-center">
            <h3 class="m-0">Fri</h3>
            {#if result.leave.same}<Check class="square-6" />{:else}<Plus class="square-6 rotate-45" />{/if}
          </div>
          <p>
            {result.leave.me}
            <br />
            {result.leave.student}
          </p>
        </div>
      {/each}
    </div>
  {/if}
</div>

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
      <p class="mb-5 mt-2 leading-normal text-muted-foreground" use:melt={$description}>Søg efter elever i søgefeltet nedenfor.</p>
      <Input bind:value={searchTerm} class="mb-5" id="student-input" />
      <div class="space-y-2">
        {#each filteredStudents as student}
          <button
            class="w-full rounded-md border border-slate-200 bg-neutral-50 text-slate-900 dark:border-slate-800 dark:bg-neutral-950 dark:text-slate-100 px-3
                  py-2 text-magnum-700 transition-opacity hover:opacity-90"
            on:click={() => {
              selectedStudent = students?.find((s) => s.name == student.original);
              // open.set(false);
            }}
            use:melt={$close}
          >
            {@html student.string.replaceAll("<Navnebeskyttet>", "Navnebeskyttet")}
          </button>
        {/each}
      </div>
      <button
        aria-label="close"
        class="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none
                  items-center justify-center rounded-full p-1 text-foreground
                  hover:bg-light-hover/60 dark:hover:bg-dark-hover/60"
        use:melt={$close}
      >
        <X class="square-4" />
      </button>
    </div>
  {/if}
</div>
