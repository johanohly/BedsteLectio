<script lang="ts">
  import type { Homework, RawHomework } from "$lib/types/homework";

  import { RequestData } from "$components";
  import { Card } from "$components/ui/card";
  import { Skeleton } from "$components/ui/skeleton";
  import { constructInterval } from "$lib/utilities";
  import { DateTime } from "luxon";
  import SvelteMarkdown from "svelte-markdown";
    import { NewTabLink } from "$components/ui/links";

  let loading = true;
  let data: RawHomework[];
  let homework: { date: string; homework: Homework[] }[] = [];
  $: if (!loading && data) {
    const tempHomework = data.map((item) => ({
      homework: item.lektier,
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
    const tempDates = tempHomework.map((item) => item.lesson.interval.start);
    let dates: DateTime[] = [];
    for (const date of tempDates) {
      if (date) {
        if (!dates.some((takenDate) => takenDate.hasSame(date, "day"))) {
          dates.push(date);
        }
      }
    }
    homework = dates.map((date) => ({
      date: formatDate(date ?? DateTime.fromMillis(0)),
      homework: tempHomework.filter((item) => item.lesson.interval.start?.hasSame(date, "day")),
    }));
  }

  const formatDate = (date: DateTime) => {
    const today = DateTime.local();
    const tomorrow = today.plus({ days: 1 });
    if (date.hasSame(today, "day")) return "I dag";
    if (date.hasSame(tomorrow, "day")) return "I morgen";
    return date.toFormat("EEEE, d/M").toTitleCase();
  };
</script>

<RequestData bind:data bind:loading path="lektier" />

<div class="page-container">
  <h1 class="mb-2">Lektier</h1>
  {#if loading}
    <Skeleton class="!mt-0 !mb-2 w-full h-24 rounded-xl" />
    <Skeleton class="!mt-0 w-full h-24 rounded-xl" />
  {:else if homework.length > 0}
    {#each homework as item}
      <div class="!mt-0">
        <span class="font-bold leading-10">{item.date}</span>
        {#each item.homework as hw}
          <div class="not-prose mb-2">
            <a href="/modul/{hw.lesson.id}">
              <Card class="p-4">
                <div class="flex flex-col flex-wrap items-stretch justify-start md:flex-row">
                  <div class="flex flex-col flex-[0_0_33%]">
                    <span class="text-black dark:text-white font-semibold leading-[1.6]">{hw.lesson.name != "" ? hw.lesson.name : hw.lesson.class}</span>
                    <span class="text-[#666666] dark:text-[#8a8a8a] leading-[1.6]">{hw.lesson.interval.toLocaleString(DateTime.TIME_24_SIMPLE)}</span>
                  </div>
                  <div class="flex flex-col flex-1 pt-4 md:pt-0">
                    <div class="prose dark:prose-invert">
                      <SvelteMarkdown source={hw.homework.replaceAll("\n", "<br>")} renderers={{ link: NewTabLink }} />
                    </div>
                    <!-- <span class="text-black dark:text-white font-medium">{hw.homework}</span> -->
                    <span class="text-[#666666] dark:text-[#8a8a8a] leading-[1.6]">{hw.lesson.class} · {hw.lesson.teacher}</span>
                  </div>
                </div>
              </Card>
            </a>
          </div>
        {/each}
      </div>
    {/each}
  {:else}
    <p class="text-center">Ingen lektier</p>
  {/if}
</div>
