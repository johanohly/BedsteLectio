<script lang="ts">
  import type { RawSimpleDocument, SimpleDocument } from "$lib/types/documents";
  import type { Homework, RawHomework } from "$lib/types/homework";
  import type { Lesson, RawLesson } from "$lib/types/lesson";
  import type { RawSimpleMessage, SimpleMessage } from "$lib/types/messages";
  import type { News, RawNews } from "$lib/types/news";
  import type { Writable } from "svelte/store";

  import { RequestData } from "$components";
  import { Skeleton } from "$components/ui/skeleton";
  import Tabs from "$components/ui/tabs/Tabs.svelte";
  import { Timeline, TimelineItem } from "$components/ui/timeline";
  import { authStore } from "$lib/stores";
  import { constructInterval, relativeTime, stringToColor, translateExamName } from "$lib/utilities";
  import { ArrowRight, Download } from "lucide-svelte";
  import { DateTime } from "luxon";
  import SvelteMarkdown from "svelte-markdown";
  import { NewTabLink } from "$components/ui/links";
  import type { Settings } from "$lib/types/settings";

  let loading = true;
  let data: {
    aktuelt: RawNews[];
    eksamener: { link: string; navn: string; dato: string }[];
    kommunikation: {
      beskeder: RawSimpleMessage[];
      dokumenter: RawSimpleDocument[];
    };
    skema: RawLesson[];
  };
  let hwLoading = true;
  let hwData: RawHomework[];

  let settings: Settings;
  let customColors: Settings["customColors"] = {};
  let classNames: Settings["classNames"] = {};
  $: if (!loading) {
    customColors = settings.customColors;
    classNames = settings.classNames;
  }

  let lessons: { [key: string]: Lesson[] } = {};
  let news: News[] = [];
  let homework: Homework[] = [];
  let messages: SimpleMessage[] = [];
  let documents: SimpleDocument[] = [];
  $: if (!loading && data) {
    const tempLessons: Lesson[] = data.skema.map((lesson) => {
      return {
        color: customColors?.[lesson.hold ?? ""] ? `hsl(${customColors?.[lesson.hold ?? ""]}, 100%, 90%)` : stringToColor(lesson.hold ?? "", 100, 90).string,
        textColor: customColors?.[lesson.hold ?? ""] ? `hsl(${customColors?.[lesson.hold ?? ""]}, 100%, 30%)` : stringToColor(lesson.hold ?? "", 100, 30).string,
        class: classNames?.[lesson.hold ?? ""] ?? lesson.hold ?? "",
        id: lesson.absid,
        interval: constructInterval(lesson.tidspunkt),
        name: lesson.navn?.replace("prv.", "prøve").replace("mdt.", "mundtlig").replace("skr.", "skriftlig") ?? "",
        note: lesson.andet ?? "",
        room: lesson.lokale ?? "",
        status: lesson.status ?? "",
        teacher: lesson.lærer ?? "",
      };
    });
    for (let i = 0; i < tempLessons.length; i++) {
      const lesson = tempLessons[i];
      const day = lesson.interval.start?.hasSame(DateTime.now(), "day") ? "I dag" : (lesson.interval.start?.hasSame(DateTime.now().plus({ days: 1 }), "day") ? "I morgen" : lesson.interval.start?.toFormat("EEEE d/M").toTitleCase()) ?? "N/A";
      if (!lessons[day]) lessons[day] = [];
      lessons[day].push(lesson);
    }

    news = data.aktuelt.map((item) => {
      return {
        description: item.text.replaceAll("@", "@<!-- -->"), // Without this, the email gets obfuscated with random hex characters. https://github.com/github/markup/issues/1168
      };
    });
    if (data.eksamener.length > 0) news.unshift({ description: `**Eksamener** \n\n ${data.eksamener.map((item) => `[${translateExamName(item.navn, classNames)}](${item.link}) ${constructInterval(item.dato).start?.toRelative()}`).join("\n\n")}` });

    messages = data.kommunikation.beskeder.map((message) => {
      return {
        date: DateTime.fromFormat(message.dato, "d/M-yyyy HH:mm", {
          locale: "da",
        }),
        id: +message.id,
        sender: message.afsender,
        title: message.navn,
      };
    });

    documents = data.kommunikation.dokumenter.map((document) => {
      return {
        author: document.afsender,
        date: DateTime.fromFormat(document.dato, "d/M-yyyy HH:mm", {
          locale: "da",
        }),
        id: +document.id,
        title: document.navn,
      };
    });
  }

  $: if (!hwLoading && hwData && !loading) {
    homework = hwData.map((item) => ({
      homework: item.lektier,
      lesson: {
        id: item.aktivitet.absid,
        class: settings.classNames?.[item.aktivitet.hold ?? ""] ?? item.aktivitet.hold ?? "",
        name: item.aktivitet.navn ?? "",
        interval: constructInterval(item.aktivitet.tidspunkt),
      },
    }));
  }

  let selectedTab: Writable<string>;
  $: filteredLessons = lessons[$selectedTab] ?? [];
</script>

<RequestData bind:data bind:loading bind:settings withSettings path="forside" />
<RequestData bind:data={hwData} bind:loading={hwLoading} path="lektier" />

<div class="page-container">
  <div class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">
    <div class="lg:col-span-2 h-[70vh] 2xl:h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.3em] flex items-center justify-between">
        <h1 class="mb-0">Skema</h1>
        <a href="/skema">
          <ArrowRight />
        </a>
      </div>
      {#if loading}
        <Skeleton class="mb-[0.25em] w-2/4 h-6 rounded-xl" />
        <Skeleton class="mb-2 w-1/4 h-[0.875em] rounded-xl" />
        <Skeleton class="mt-[1.25em] mb-[0.5em] w-3/4 h-[1em] rounded-xl" />
        <Skeleton class="w-3/4 h-[1em] rounded-xl" />
        <Skeleton class="mt-8 mb-[0.25em] w-2/4 h-6 rounded-xl" />
        <Skeleton class="mb-2 w-1/4 h-[0.875em] rounded-xl" />
        <Skeleton class="mt-[1.25em] mb-[0.5em] w-3/4 h-[1em] rounded-xl" />
        <Skeleton class="w-3/4 h-[1em] rounded-xl" />
        <Skeleton class="mt-8 mb-[0.25em] w-2/4 h-6 rounded-xl" />
        <Skeleton class="mb-2 w-1/4 h-[0.875em] rounded-xl" />
        <Skeleton class="mt-[1.25em] mb-[0.5em] w-3/4 h-[1em] rounded-xl" />
        <Skeleton class="w-3/4 h-[1em] rounded-xl" />
      {:else if lessons}
        <Tabs bind:selectedTab defaultActive={Object.keys(lessons)[0]} tabs={Object.keys(lessons)} />
        <div class="overflow-y-auto">
          <Timeline class="ml-3">
            {#key filteredLessons}
              {#each filteredLessons as lesson}
                <TimelineItem cancelled={lesson.status == "aflyst"} class="mb-10" color={lesson.color} textColor={lesson.textColor} description={`${lesson.note != "" ? `${lesson.note}<br>${lesson.room}` : lesson.room}`} link={`/modul/${lesson.id}`} time={lesson.interval.toLocaleString(DateTime.TIME_24_SIMPLE)} title={lesson.name != "" ? lesson.name : lesson.class} titleNote={lesson.teacher} />
              {/each}
            {/key}
          </Timeline>
        </div>
      {:else}
        <p>Ingen kommende lektioner.</p>
      {/if}
    </div>
    <div class="lg:col-span-1 h-[70vh] 2xl:h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <h1 class="mb-0">Aktuelt</h1>
      <div class="block overflow-y-auto not-prose">
        {#if loading}
          <Skeleton class="mt-[1.25em] w-3/4 h-[1em]" />
          <Skeleton class="mt-[1em] w-full h-[1em]" />
          <Skeleton class="mt-[1em] w-full h-[1em]" />
          <Skeleton class="mt-[2.25em] w-3/4 h-[1em]" />
          <Skeleton class="mt-[1em] w-full h-[1em]" />
          <Skeleton class="mt-[1em] w-full h-[1em]" />
          <Skeleton class="mt-[2.25em] w-3/4 h-[1em]" />
          <Skeleton class="mt-[1em] w-full h-[1em]" />
          <Skeleton class="mt-[1em] w-full h-[1em]" />
        {:else if news.length > 0}
          <div class="space-y-2">
            {#each news as item, i}
              <SvelteMarkdown source={item.description} renderers={{ link: NewTabLink }} />
              {#if i != news.length - 1}
                <hr class="!my-4 dark:border-t-gray-600/50" />
              {/if}
            {/each}
          </div>
        {:else}
          <p>Ingen aktuelle nyheder.</p>
        {/if}
      </div>
    </div>
    <div class="lg:col-span-1 lg:row-start-2 h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.3em] flex items-center justify-between">
        <h1 class="mb-0">Lektier</h1>
        <a href="/lektier">
          <ArrowRight />
        </a>
      </div>
      <div class="block overflow-y-auto">
        {#if hwLoading || loading}
          loading
        {:else if homework.length > 0}
          {#each homework as hwItem}
            <a class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4" href="/modul/{hwItem.lesson.id}" target="_blank">
              <div class="flex-1 min-w-0">
                <p class="mb-0 text-md font-semibold text-gray-900 truncate dark:text-white">
                  {hwItem.lesson.name != "" ? hwItem.lesson.name : hwItem.lesson.class}
                </p>
                <div class="!m-0">
                  <SvelteMarkdown source={hwItem.homework} renderers={{ link: NewTabLink }} />
                </div>

                <p use:relativeTime={(hwItem.lesson.interval.start ?? DateTime.now()).toJSDate()} class="mt-0 text-sm text-gray-500 truncate dark:text-gray-400" />
              </div>
            </a>
          {/each}
        {:else}
          <p>Ingen kommende lektier.</p>
        {/if}
      </div>
    </div>
    <div class="lg:col-span-1 lg:row-start-2 h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.3em] flex items-center justify-between">
        <h1 class="mb-0">Beskeder</h1>
        <a href="/beskeder">
          <ArrowRight />
        </a>
      </div>
      <div class="block overflow-y-auto">
        {#if loading}
          loading
        {:else if messages.length > 0}
          {#each messages as message}
            <a class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4" href={`/beskeder?id=${message.id}`}>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">
                  {message.title}
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {message.sender}
                </p>
              </div>
              <div class="inline-flex items-center text-sm text-gray-900 dark:text-white">
                {message.date.toLocaleString(DateTime.DATE_SHORT)}
              </div>
            </a>
          {/each}
        {:else}
          <p>Ingen nye beskeder.</p>
        {/if}
      </div>
    </div>
    <div class="lg:col-span-1 lg:row-start-2 h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.3em] flex items-center justify-between">
        <h1 class="mb-0">Dokumenter</h1>
        <a href="/dokumenter">
          <ArrowRight />
        </a>
      </div>
      <div class="block overflow-y-auto">
        {#if loading}
          loading
        {:else if documents.length > 0}
          {#each documents as document}
            <a class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4" href={`https://www.lectio.dk/lectio/${$authStore.school}/dokumenthent.aspx?documentid=${document.id}`} target="_blank">
              <div class="flex-1 min-w-0">
                <p class="flex items-center text-sm font-semibold text-gray-900 truncate dark:text-white">
                  {document.title}<Download class="ml-2" size="20" />
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {document.author}
                </p>
              </div>
              <div class="inline-flex items-center text-sm text-gray-900 dark:text-white">
                {document.date.toLocaleString(DateTime.DATE_SHORT)}
              </div>
            </a>
          {/each}
        {:else}
          <p>Ingen nye dokumenter.</p>
        {/if}
      </div>
    </div>
  </div>
</div>
