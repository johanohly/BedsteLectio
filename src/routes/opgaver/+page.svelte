<script lang="ts">
  import type { RawSimpleAssignment, SimpleAssignment } from "$lib/types/assignments";
  import type { Writable } from "svelte/store";

  import { RequestData } from "$components";
  import { Badge } from "$components/ui/badge";
  import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "$components/ui/card";
  import { Skeleton } from "$components/ui/skeleton";
  import Tabs from "$components/ui/tabs/Tabs.svelte";
  import { filter } from "fuzzy";
  import { Search } from "lucide-svelte";
  import { DateTime } from "luxon";
  import { relativeTime, stringToColor } from "$lib/utilities";

  let loading = true;
  let data: RawSimpleAssignment[];
  let assignments: SimpleAssignment[] = [];
  let sortedAssignments: SimpleAssignment[] = [];

  $: if (!loading && data) {
    assignments = data.map((assignment) => ({
      date: DateTime.fromFormat(assignment.frist, "d/M-yyyy HH:mm", {
        locale: "da",
      }),
      description: assignment.opgavenote,
      class: assignment.hold,
      link: `/opgave/${assignment.exerciseid}`,
      status: assignment.status,
      awaits: assignment.afventer,
      title: assignment.opgavetitel,
    }));
  }

  let width = 0;
  type Status = "Færdige" | "Kommende" | "Afventer Feedback" | "Manglende";
  let selectedTab: Writable<Status>;
  let searchTerm = "";
  let matchingAssignments: string[] = [];
  $: if (searchTerm) {
    matchingAssignments = filter(
      searchTerm,
      sortedAssignments.map((assignment) => `${assignment.title} ${assignment.hold}`),
      {}
    )
      .filter((result) => result.score > 0.5)
      .map((result) => result.string);
  } else {
    matchingAssignments = [];
  }
  $: sortedAssignments = assignments.filter((opgave) => {
    if ($selectedTab == "Afventer Feedback") {
      return opgave.status == "Afleveret" && opgave.awaits === "Lærer";
    }
    else if ($selectedTab == "Kommende") {
      return opgave.status == "Venter";
    } else if ($selectedTab == "Færdige") {
      return opgave.status == "Afleveret";
    } else if ($selectedTab == "Manglende") {
      return opgave.status == "Mangler";
    }
  });
</script>

<svelte:window bind:innerWidth={width} />
<RequestData bind:data bind:loading path="opgaver" />

<div class="!overflow-hidden page-container">
  <div class="max-h-[88vh] flex flex-col">
    <h1 class="mb-2">Opgaver</h1>
    <div class="flex justify-between">
      <Tabs bind:selectedTab defaultActive="Kommende" tabs={["Kommende", "Færdige", ...(width > 1024 ? ["Afventer Feedback"] : []), "Manglende"]} />
      <div class="hidden md:block relative">
        <div class="absolute h-10 inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search class="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <input autocapitalize="off" autocomplete="off" autocorrect="off" bind:value={searchTerm} class="bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 text-sm rounded-lg block h-10 pl-10 p-2.5 dark:placeholder:text-[#3b3b3b] focus:ring-blue-500 focus:border-blue-500" placeholder="Søg..." spellcheck="false" type="search" />
      </div>
    </div>
    <div class="overflow-y-auto">
      {#if loading}
        <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
        <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
        <Skeleton class="w-full h-36 rounded-[10px]" />
      {:else if sortedAssignments.length > 0}
        {#each sortedAssignments
          .filter((assignment) => (matchingAssignments.length ? matchingAssignments.includes(`${assignment.title} ${assignment.class}`) : true))
          .sort(function (a, b) {
            const now = DateTime.local().toMillis();
            const diff1 = Math.abs(a.date.toMillis() - now);
            const diff2 = Math.abs(b.date.toMillis() - now);
            return diff1 - diff2;
          }) as assignment}
          <div class="not-prose">
            <a href={assignment.link}>
              <Card animate={true} class="mb-4">
                <CardHeader>
                  <CardTitle>{assignment.title}<span style:--color={stringToColor(assignment.class, 100, 90).string} style:--textColor={stringToColor(assignment.class, 100, 30).string} class="custom-color hidden lg:block text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3 dark:!bg-blue-900 dark:!text-blue-300">{assignment.class}</span></CardTitle>
                  <CardDescription>{assignment.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge><span use:relativeTime={assignment.date.toJSDate()} /></Badge>
                </CardFooter>
              </Card>
            </a>
          </div>
        {/each}
      {:else}
        <p class="text-center">
          Du har ingen {$selectedTab.toLowerCase()} opgaver.
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  .custom-color {
    background-color: var(--color);
    color: var(--textColor);
  }
</style>
