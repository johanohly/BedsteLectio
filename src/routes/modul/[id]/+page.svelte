<script lang="ts">
  import type { Module, RawModule } from "$lib/types/module";

  import { Skeleton } from "$components/ui/skeleton";
  import { authStore } from "$lib/stores";
  import { constructInterval, decodeHtml, relativeTime } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { ExternalLink } from "lucide-svelte";
  import { DateTime } from "luxon";
  import SvelteMarkdown from "svelte-markdown";

  import type { PageData } from "./$types";
  import { NewTabLink } from "$components/ui/links";
  import type { Settings } from "$lib/types/settings";
  import { Tabs } from "$components/ui/tabs";
  import type { Writable } from "svelte/store";
  import { MultiRequestData } from "$components";
  import { Avatar } from "$components/ui/avatar";
  import { Tab } from "$components/ui/tab";

  export let data: PageData;

  const NAME_REGEX = /^[^\(]*/;

  let loading = true;
  let failed = false;
  let returnData = {};
  let module: Module;
  let settings: Settings;
  $: if (!loading && returnData) {
    try {
      // @ts-ignore
      const students = Object.entries((returnData["informationer"].elever as { [key: string]: string }) ?? {}).map(([name, id]) => ({
        id,
        name: NAME_REGEX.exec(name ?? "")?.[0].trim() ?? name ?? "",
      }));
      const me = students.find((student) => student.id == `S${decodeUserID($authStore.cookie)}`);

      // @ts-ignore
      const moduleData = returnData[`modul?absid=${data.id}`] as RawModule;
      const rawGroups = moduleData.grupper ?? {};
      const groups = Object.keys(rawGroups).map((key) => ({
        name: key,
        isMe: rawGroups[key].includes(me?.name ?? ""),
        members: rawGroups[key].map((name) => {
          const student = students.find((student) => student.name == name);
          return {
            name,
            id: student?.id ?? "",
            me: student?.id == me?.id,
          };
        }),
      }));

      module = {
        homework: moduleData.lektier,
        lesson: {
          class: settings.classNames?.[moduleData.aktivitet.hold ?? ""] ?? moduleData.aktivitet.hold ?? "",
          interval: constructInterval(moduleData.aktivitet.tidspunkt),
          name: decodeHtml(moduleData.aktivitet.navn ?? ""),
          room: moduleData.aktivitet.lokale ?? "",
          teacher: moduleData.aktivitet.lærer ?? "",
        },
        note: moduleData.note,
        otherContent: moduleData.øvrigtIndhold,
        groups,
        presentation: moduleData.præsentation,
      };
    } catch (e) {
      failed = true;
    }
  }

  let selectedGroup: Writable<string>;
</script>

<MultiRequestData
  bind:data={returnData}
  bind:loading
  bind:settings
  withSettings
  onServerError={{
    active: true,
    path: "/skema",
    toast: {
      color: "bg-red-500",
      description: "Dette modul findes ikke.",
      title: "Ukendt modul",
    },
    error: false,
  }}
  paths={[`modul?absid=${data.id}`, "informationer"]}
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
  {:else if failed}
    <div class="flex flex-col items-center">
      <h1 class="!mb-0">Moduler kan ikke ses lige nu</h1>
      <p class="!mt-0 !mb-0">Her er linket til lectio modulet.</p>
      <a class="flex items-center h-8 px-3 rounded-[6px] no-underline bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black" href={`https://www.lectio.dk/lectio/${$authStore.school}/aktivitet/aktivitetforside2.aspx?absid=${data.id}&elevid=${decodeUserID($authStore.cookie)}`} target="_blank">Lectio <ExternalLink class="ml-2 h-4 w-4" /></a>
    </div>
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
        <SvelteMarkdown source={module.note} renderers={{ link: NewTabLink }} />
      </section>
    {/if}
    {#if module.homework}
      <section>
        <h2 class="!mb-0">Lektier</h2>
        <SvelteMarkdown source={module.homework} renderers={{ link: NewTabLink }} />
      </section>
    {/if}
    {#if module.groups.length > 0}
      <section>
        <div class="flex flex-col max-md:pb-4 md:flex-row md:justify-between">
          <h2 class="!m-0">Grupper</h2>
          <div class="hidden md:block">
            <Tabs bind:selectedTab={selectedGroup} defaultActive={module.groups.find((group) => group.isMe)?.name} tabs={module.groups.map((group) => group.name)} />
          </div>
          <div class="flex space-x-2 max-md:pt-1 md:hidden">
            {#each module.groups as group}
              <Tab on:click={() => {selectedGroup.set(group.name)}} selected={group.name === $selectedGroup} class="text-xl font-mono {group.isMe && "bg-[#abfcb7] dark:bg-[#8678F9] text-black dark:text-white"}">{group.name.match(/\d+/)?.[0]}</Tab>
            {/each}
          </div>
        </div>
        <div class="space-y-1">
          {#key $selectedGroup}
            {#each module.groups.find((group) => group.name == $selectedGroup)?.members ?? [] as member}
              <div class="flex gap-2 items-center">
                <Avatar user={{ name: member.name, id: member.id }} />
                <p class="!m-0 {member.me ? 'font-bold' : ''}">{member.name}</p>
              </div>
            {/each}
          {/key}
        </div>
      </section>
    {/if}
    {#if module.otherContent}
      <section>
        <h2 class="!mb-0">Øvrigt Indhold</h2>
        <SvelteMarkdown source={module.otherContent} renderers={{ link: NewTabLink }} />
      </section>
    {/if}
    {#if module.presentation}
      <section>
        <h2 class="!mb-0">Præsentation</h2>
        <SvelteMarkdown source={module.presentation} renderers={{ link: NewTabLink }} />
      </section>
    {/if}
  {/if}
</div>
