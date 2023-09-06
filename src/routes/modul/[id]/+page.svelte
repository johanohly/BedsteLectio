<script lang="ts">
  import { RequestData } from "$components";
  import { Skeleton } from "$components/ui/skeleton";
  import type { Module, RawModule } from "$lib/types/module";
  import { constructInterval } from "$lib/utilities";
  import { authStore } from "$lib/stores";
  import { DateTime } from "luxon";
  import type { PageData } from "./$types";
  import SvelteMarkdown from "svelte-markdown";
  import { ExternalLink } from "lucide-svelte";
  import { decodeUserID } from "$lib/utilities/cookie";

  export let data: PageData;

  let loading = true;
  let moduleData: RawModule;
  let module: Module;
  $: if (!loading && moduleData) {
    module = {
      lesson: {
        id: moduleData.aktivitet.absid,
        name: moduleData.aktivitet.navn ?? "",
        class: moduleData.aktivitet.hold ?? "",
        teacher: moduleData.aktivitet.lærer ?? "",
        status: moduleData.aktivitet.status ?? "",
        room: moduleData.aktivitet.lokale ?? "",
        note: moduleData.aktivitet.andet ?? "",
        interval: constructInterval(moduleData.aktivitet.tidspunkt),
      },
      homework: moduleData.lektier,
      note: moduleData.note,
      presentation: moduleData.præsentation,
      otherContent: moduleData.øvrigt_indhold,
    };
  }
</script>

<RequestData
  bind:loading
  bind:data={moduleData}
  path={`modul?absid=${data.id}`}
  onServerError={{
    active: true,
    path: "/skema",
    toast: {
      title: "Ukendt modul",
      description: "Dette modul findes ikke.",
      color: "bg-red-500",
    },
  }}
/>

<div class="page-container">
  {#if loading}
    <Skeleton class="w-1/2 rounded-xl h-[2.2em]" />
    <Skeleton class="!mt-1 w-3/4 rounded-xl h-[1em]" />
    <Skeleton class="!mt-1 w-3/4 rounded-xl h-[1em]" />
    <Skeleton class="!mt-2 w-1/4 rounded-xl h-[1.5em]" />
    <Skeleton class="!mt-1 w-3/4 rounded-xl h-[1em]" />
    <Skeleton class="!mt-24 w-1/4 rounded-xl h-[2em]" />
    <Skeleton class="!mt-1 w-1/2 rounded-xl h-[1em]" />
    <Skeleton class="!mt-4 w-full rounded-[10px] h-[8em]" />
    <Skeleton class="!mt-4 w-full rounded-[10px] h-[8em]" />
    <Skeleton class="!mt-4 w-full rounded-[10px] h-[8em]" />
  {:else}
    <section>
      <div
        class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between"
      >
        {#if module.lesson.name != ""}
          <h1 class="!mb-0">{module.lesson.name} ({module.lesson.class})</h1>
        {:else}
          <h1 class="!mb-0">{module.lesson.class}</h1>
        {/if}
        <a
          href={`https://www.lectio.dk/lectio/${
            $authStore.school
          }/aktivitet/aktivitetforside2.aspx?absid=${
            data.id
          }&elevid=${decodeUserID($authStore.cookie)}`}
          target="_blank"
          class="flex items-center h-8 px-3 rounded-[6px] no-underline bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black"
          >Lectio <ExternalLink class="ml-2 h-4 w-4" /></a
        >
      </div>

      <h3 class="!mt-1 !mb-0">Modul</h3>
      <p class="!mt-0 !mb-0">
        Tidspunkt: {module.lesson.interval.toLocaleString(
          DateTime.DATETIME_FULL
        )} ({module.lesson.interval.start?.toRelative()})
        <br />
        Lokale: {module.lesson.room}
        <br />
        Lærer: {module.lesson.teacher}
      </p>
    </section>
    {#if module.note}
      <section>
        <h2 class="!mb-0">Note</h2>
        <SvelteMarkdown source={module.note} />
      </section>
    {/if}
    {#if module.homework}
      <section>
        <h2 class="!mb-0">Lektier</h2>
        <SvelteMarkdown source={module.homework.replaceAll("\n", "<br>")} />
      </section>
    {/if}
    {#if module.otherContent}
      <section>
        <h2 class="!mb-0">Øvrigt Indhold</h2>
        <SvelteMarkdown source={module.otherContent} />
      </section>
    {/if}
    {#if module.presentation}
      <section>
        <h2 class="!mb-0">Præsentation</h2>
        <SvelteMarkdown source={module.presentation} />
      </section>
    {/if}
  {/if}
</div>
