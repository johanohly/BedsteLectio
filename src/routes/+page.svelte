<script lang="ts">
  import { RequestData } from "$components";
  import { Skeleton } from "$components/ui/skeleton";
  import Tabs from "$components/ui/tabs/Tabs.svelte";
  import { Timeline, TimelineItem } from "$components/ui/timeline";
  import { authStore } from "$lib/stores";
  import type { Document, RawDocument } from "$lib/types/documents";
  import type { Homework, RawHomework } from "$lib/types/homework";
  import type { Lesson, RawLesson } from "$lib/types/lesson";
  import type { Message, RawMessage } from "$lib/types/messages";
  import type { News, RawNews } from "$lib/types/news";
  import { constructInterval } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { ArrowRight, Download } from "lucide-svelte";
  import { DateTime } from "luxon";
  import SvelteMarkdown from "svelte-markdown";
  import type { Writable } from "svelte/store";

  let loading = true;
  let data: {
    skema: RawLesson[];
    aktuelt: RawNews[];
    kommunikation: {
      beskeder: RawMessage[];
      dokumenter: RawDocument[];
    };
  };
  let hwLoading = true;
  let hwData: RawHomework[];

  let lessons: { day: string; selected: boolean; lessons: Lesson[] }[] = [];
  let news: News[] = [];
  let homework: Homework[] = [];
  let messages: Message[] = [];
  let documents: Document[] = [];
  $: if (!loading && data) {
    const tempLessons: Lesson[] = data.skema.map((lesson) => {
      return {
        id: lesson.absid,
        name:
          lesson.navn
            ?.replace("prv.", "prøve")
            .replace("mdt.", "mundtlig")
            .replace("skr.", "skriftlig") ?? "",
        class: lesson.hold ?? "",
        teacher: lesson.lærer ?? "",
        status: lesson.status ?? "",
        room: lesson.lokale ?? "",
        note: lesson.andet ?? "",
        interval: constructInterval(lesson.tidspunkt),
      };
    });
    for (let i = 0; i < tempLessons.length; i++) {
      const lesson = tempLessons[i];
      const day = lesson.interval.start?.hasSame(DateTime.now(), "day")
        ? "I dag"
        : (lesson.interval.start?.hasSame(
            DateTime.now().plus({ days: 1 }),
            "day"
          )
            ? "I morgen"
            : lesson.interval.start?.toFormat("EEEE d/M").toTitleCase()) ??
          "N/A";
      const dayIndex = lessons.findIndex((item) => item.day === day);
      if (dayIndex === -1) {
        lessons.push({
          day,
          selected: i == 0,
          lessons: [lesson],
        });
      } else {
        lessons[dayIndex].lessons.push(lesson);
      }
    }

    news = data.aktuelt.map((item) => {
      return {
        description: item.text.replace("@", "@<!-- -->"), // Without this, the email gets obfuscated with random hex characters. https://github.com/github/markup/issues/1168
      };
    });

    messages = data.kommunikation.beskeder.map((message) => {
      return {
        sender: message.afsender,
        date: DateTime.fromFormat(message.dato, "d/M-yyyy HH:mm", {
          locale: "da",
        }),
        id: +message.id,
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
      lesson: {
        id: item.aktivitet.absid,
        name: item.aktivitet.navn ?? "",
        class: item.aktivitet.hold ?? "",
        teacher: item.aktivitet.lærer ?? "",
        status: item.aktivitet.status ?? "",
        room: item.aktivitet.lokale ?? "",
        note: item.aktivitet.andet ?? "",
        interval: constructInterval(item.aktivitet.tidspunkt),
      },
      homework: item.lektier.beskrivelse,
    }));
  }

  let selectedTab: Writable<string>;
  $: if (lessons.length > 0) {
    const currentIndex = lessons.findIndex((item) => item.day == $selectedTab);
    const selectedIndex = lessons.findIndex((item) => item.selected);
    if (currentIndex !== selectedIndex) {
      lessons[currentIndex].selected = true;
      lessons[selectedIndex].selected = false;
    }
  }
</script>

<RequestData bind:loading bind:data path="forside" />
<RequestData bind:loading={hwLoading} bind:data={hwData} path="lektier" />

<div class="page-container">
  <div class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">
    <div
      class="lg:col-span-2 max-h-[70vh] 2xl:max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6"
    >
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
      {:else if lessons.length > 0}
        <Tabs
          bind:selectedTab
          tabs={lessons.map((item) => item.day)}
          defaultActive={lessons[0].day}
        />
        <div class="overflow-y-auto">
          <Timeline class="ml-3">
            {#each lessons.filter((day) => day.selected)[0].lessons as lesson}
              <TimelineItem
                class="mb-10"
                title={lesson.name != "" ? lesson.name : lesson.class}
                titleNote={lesson.teacher}
                description={`${
                  lesson.note != ""
                    ? `${lesson.note}<br>${lesson.room}`
                    : lesson.room
                }`}
                time={lesson.interval.toLocaleString(DateTime.TIME_24_SIMPLE)}
                link={`/modul/${lesson.id}`}
              />
            {/each}
          </Timeline>
        </div>
      {:else}
        <p class="text-center">Ingen kommende lektioner.</p>
      {/if}
    </div>
    <div
      class="lg:col-span-1 max-h-[70vh] 2xl:max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6"
    >
      <h1 class="mb-0">Aktuelt</h1>
      <div class="block overflow-y-auto">
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
          {#each news as item}
            <SvelteMarkdown source={item.description} />
          {/each}
        {:else}
          <p class="text-center">Ingen aktuelle nyheder.</p>
        {/if}
      </div>
    </div>
    <div
      class="lg:col-span-1 lg:row-start-2 max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6"
    >
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
            <a
              target="_blank"
              href="/modul/{hwItem.lesson.id}"
              class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4"
            >
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold text-gray-900 truncate dark:text-white"
                >
                  {hwItem.lesson.name != ""
                    ? hwItem.lesson.name
                    : hwItem.lesson.class}
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
    <div
      class="lg:col-span-1 lg:row-start-2 max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6"
    >
      <h1>Beskeder</h1>
      <div class="block overflow-y-auto">
        {#if loading}
          loading
        {:else if messages.length > 0}
          {#each messages as message}
            <a
              target="_blank"
              href={`https://www.lectio.dk/lectio/${
                $authStore.school
              }/beskeder2.aspx?type=showthread&id=${
                message.id
              }&elevid=${decodeUserID($authStore.cookie)}`}
              class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4"
            >
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold text-gray-900 truncate dark:text-white"
                >
                  {message.title}
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {message.sender}
                </p>
              </div>
              <div
                class="inline-flex items-center text-sm text-gray-900 dark:text-white"
              >
                {message.date.toLocaleString(DateTime.DATE_SHORT)}
              </div>
            </a>
          {/each}
        {:else}
          <p class="text-center">Ingen nye beskeder.</p>
        {/if}
      </div>
    </div>
    <div
      class="lg:col-span-1 lg:row-start-2 max-h-[50vh] flex flex-col bg-white dark:bg-dark rounded-2xl p-6"
    >
      <h1>Dokumenter</h1>
      <div class="block overflow-y-auto">
        {#if loading}
          loading
        {:else if documents.length > 0}
          {#each documents as document}
            <a
              target="_blank"
              href={`https://www.lectio.dk/lectio/${$authStore.school}/dokumenthent.aspx?documentid=${document.id}`}
              class="no-underline flex items-center space-x-4 hover:bg-gray-100 dark:hover:bg-dark-hover hover:rounded-2xl px-4"
            >
              <div class="flex-1 min-w-0">
                <p
                  class="flex items-center text-sm font-semibold text-gray-900 truncate dark:text-white"
                >
                  {document.title}<Download class="ml-2" size="20" />
                </p>
                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {document.author}
                </p>
              </div>
              <div
                class="inline-flex items-center text-sm text-gray-900 dark:text-white"
              >
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
