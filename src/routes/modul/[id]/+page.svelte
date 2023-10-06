<script lang="ts">
  import type { Module, RawModule } from "$lib/types/module";

  import { RequestData } from "$components";
  import { Skeleton } from "$components/ui/skeleton";
  import { authStore } from "$lib/stores";
  import { constructInterval, relativeTime } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { ExternalLink } from "lucide-svelte";
  import { DateTime } from "luxon";
  import SvelteMarkdown from "svelte-markdown";

  import type { PageData } from "./$types";

  export let data: PageData;

  let loading = true;
  let moduleData: RawModule;
  let module: Module;
  $: if (!loading && moduleData) {
    module = {
      homework: moduleData.lektier,
      lesson: {
        class: moduleData.aktivitet.hold ?? "",
        id: moduleData.aktivitet.absid,
        interval: constructInterval(moduleData.aktivitet.tidspunkt),
        name: moduleData.aktivitet.navn ?? "",
        note: moduleData.aktivitet.andet ?? "",
        room: moduleData.aktivitet.lokale ?? "",
        status: moduleData.aktivitet.status ?? "",
        teacher: moduleData.aktivitet.lærer ?? "",
      },
      note: moduleData.note,
      otherContent: moduleData.øvrigtIndhold,
      presentation: moduleData.præsentation,
    };
  }
</script>

<RequestData
  bind:data={moduleData}
  bind:loading
  onServerError={{
    active: true,
    path: "/skema",
    toast: {
      color: "bg-red-500",
      description: "Dette modul findes ikke.",
      title: "Ukendt modul",
    },
  }}
  path={`modul?absid=${data.id}`}
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
      <div class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between">
        {#if module.lesson.name != ""}
          <h1 class="!mb-0">{module.lesson.name} ({module.lesson.class})</h1>
        {:else}
          <h1 class="!mb-0">{module.lesson.class}</h1>
        {/if}
        <a class="flex items-center h-8 px-3 rounded-[6px] no-underline bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black" href={`https://www.lectio.dk/lectio/${$authStore.school}/aktivitet/aktivitetforside2.aspx?absid=${data.id}&elevid=${decodeUserID($authStore.cookie)}`} target="_blank">Lectio <ExternalLink class="ml-2 h-4 w-4" /></a>
      </div>

      <h3 class="!mt-1 !mb-0">Modul</h3>
      <p class="!mt-0 !mb-0">
        Tidspunkt: {module.lesson.interval.toLocaleString(DateTime.DATETIME_FULL)} (<span use:relativeTime={(module.lesson.interval.start ?? DateTime.now()).toJSDate()} />)
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
        <SvelteMarkdown source={module.otherContent.replaceAll(")", ")<br>")} />
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
