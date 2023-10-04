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
  import { constructInterval } from "$lib/utilities";
  import { ArrowRight, Download } from "lucide-svelte";
  import { DateTime } from "luxon";
  import SvelteMarkdown from "svelte-markdown";

  let loading = true;
  let data: {
    aktuelt: RawNews[];
    kommunikation: {
      beskeder: RawSimpleMessage[];
      dokumenter: RawSimpleDocument[];
    };
    skema: RawLesson[];
  };
  let hwLoading = true;
  let hwData: RawHomework[];

  let lessons: { [key: string]: Lesson[] } = {};
  let news: News[] = [];
  let homework: Homework[] = [];
  let messages: SimpleMessage[] = [];
  let documents: SimpleDocument[] = [];
  $: if (!loading && data) {
    const tempLessons: Lesson[] = data.skema.map((lesson) => {
      return {
        class: lesson.hold ?? "",
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

  $: if (!hwLoading && hwData) {
    homework = hwData.map((item) => ({
      homework: item.lektier.beskrivelse,
      lesson: {
        class: item.aktivitet.hold ?? "",
        id: item.aktivitet.absid,
        interval: constructInterval(item.aktivitet.tidspunkt),
        name: item.aktivitet.navn ?? "",
        note: item.aktivitet.andet ?? "",
        room: item.aktivitet.lokale ?? "",
        status: item.aktivitet.status ?? "",
        teacher: item.aktivitet.lærer ?? "",
      },
    }));
  }

  let selectedTab: Writable<string>;
  $: filteredLessons = lessons[$selectedTab] ?? [];
</script>

<RequestData bind:data bind:loading path="forside" />
<RequestData bind:data={hwData} bind:loading={hwLoading} path="lektier" />

<div class="page-container">
  <div class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">
    <div class="lg:col-span-2 max-h-[70vh] 2xl:max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.8888889em] flex items-center justify-between">
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
      {:else if lessons != {}}
        <Tabs bind:selectedTab defaultActive={Object.keys(lessons)[0]} tabs={Object.keys(lessons)} />
        <div class="overflow-y-auto">
          <Timeline class="ml-3">
            {#each filteredLessons as lesson}
              <TimelineItem class="mb-10" description={`${lesson.note != "" ? `${lesson.note}<br>${lesson.room}` : lesson.room}`} link={`/modul/${lesson.id}`} time={lesson.interval.toLocaleString(DateTime.TIME_24_SIMPLE)} title={lesson.name != "" ? lesson.name : lesson.class} titleNote={lesson.teacher} />
            {/each}
          </Timeline>
        </div>
      {:else}
        <p class="text-center">Ingen kommende lektioner.</p>
      {/if}
    </div>
    <div class="lg:col-span-1 max-h-[70vh] 2xl:max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
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
              <SvelteMarkdown source={item.description} />
              {#if i != news.length - 1}
                <hr class="!my-4 dark:border-t-gray-600/50" />
              {/if}
            {/each}
          </div>
        {:else}
          <p class="text-center">Ingen aktuelle nyheder.</p>
        {/if}
      </div>
    </div>
    <div class="lg:col-span-1 lg:row-start-2 max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.8888889em] flex items-center justify-between">
        <h1 class="mb-0">Lektier</h1>
        <a href="/lektier">
          <ArrowRight />
        </a>
      </div>
      <div class="block overflow-y-auto">
        {#if hwLoading}
          loading
        {:else if homework.length > 0}
          {#each homework as hwItem}
            <a class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4" href="/modul/{hwItem.lesson.id}" target="_blank">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">
                  {hwItem.lesson.name != "" ? hwItem.lesson.name : hwItem.lesson.class}
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {hwItem.homework}
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {hwItem.lesson.interval.start?.toRelative()}
                </p>
              </div>
            </a>
          {/each}
        {:else}
          <p class="text-center">Ingen kommende lektier.</p>
        {/if}
      </div>
    </div>
    <div class="lg:col-span-1 lg:row-start-2 max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.8888889em] flex items-center justify-between">
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
          <p class="text-center">Ingen nye beskeder.</p>
        {/if}
      </div>
    </div>
    <div class="lg:col-span-1 lg:row-start-2 max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6">
      <div class="mb-[0.8888889em] flex items-center justify-between">
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
          <p class="text-center">Ingen nye dokumenter.</p>
        {/if}
      </div>
    </div>
  </div>
</div>
