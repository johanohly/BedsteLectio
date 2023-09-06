<script lang="ts">
  import type { RawAssignment, Assignment } from "$lib/types/assignments";

  import {
    CardDescription,
    CardHeader,
    CardTitle,
    Card,
  } from "$components/ui/card";
  import { ExternalLink, Download } from "lucide-svelte";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { Skeleton } from "$components/ui/skeleton";
  import SvelteMarkdown from "svelte-markdown";
  import { RequestData } from "$components";
  import { authStore } from "$lib/stores";
  import { DateTime } from "luxon";

  import type { PageData } from "./$types";

  export let data: PageData;

  let loading = true;
  let assignmentData: RawAssignment;
  let assignment: Assignment;
  $: if (!loading && assignmentData) {
    console.log(assignmentData);
    assignment = {
      billedTime: assignmentData.oplysninger.elevtid,
      class: assignmentData.oplysninger.hold,
      date: DateTime.fromFormat(
        assignmentData.oplysninger.afleveringsfrist,
        "d/M-yyyy HH:mm",
        {
          locale: "da",
        }
      ),
      description: assignmentData.oplysninger.opgavenote,
      details:
        assignmentData.oplysninger.opgavebeskrivelse?.replace(")", ")<br>") ??
        "",
      documents: assignmentData.opgave_indlæg.map((document) => ({
        date: DateTime.fromFormat(document.tidspunkt, "d/M-yyyy HH:mm", {
          locale: "da",
        }),
        name: document.dokument.match(/\[(.*?)\]/)[1],
        url: document.dokument.match(/\((.*?)\)/)[1],
        user: {
          id: document.bruger.bruger_id,
          name: document.bruger.navn,
        },
      })),
      participants: assignmentData.gruppemedlemmer.map((participant) => ({
        id: participant.bruger_id,
        name: participant.navn,
      })),
      status: assignmentData.afleveres_af.status_fravær
        .toLowerCase()
        .replace("aflev.", "afleveret "),
      title: assignmentData.oplysninger.opgavetitel,
    };
  }
</script>

<RequestData
  onServerError={{
    active: true,
    path: "/opgaver",
    toast: {
      color: "bg-red-500",
      description: "Denne opgave findes ikke.",
      title: "Ukendt opgave",
    },
  }}
  path={`opgave?exerciseid=${data.id}`}
  bind:data={assignmentData}
  bind:loading
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
        <h1 class="!mb-0">{assignment.title} ({assignment.class})</h1>
        <a
          href={`https://www.lectio.dk/lectio/${
            $authStore.school
          }/ElevAflevering.aspx?exerciseid=${data.id}&elevid=${decodeUserID(
            $authStore.cookie
          )}`}
          class="flex items-center h-8 px-3 rounded-[6px] no-underline bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black"
          target="_blank"
          >Lectio <ExternalLink class="ml-2 h-4 w-4" /></a
        >
      </div>
      <p class="!mt-0 !mb-0">{assignment.description}</p>
      {#if assignment.details}
        <h3 class="!mt-1 !mb-0">Opgavebeskrivelse</h3>
        <SvelteMarkdown source={assignment.details} />
      {/if}
      <h3 class="!mt-1 !mb-0">Status</h3>
      <p class="!mt-0 !mb-0">
        Du har {assignment.status}
        <br />
        Elevtid: {assignment.billedTime}
      </p>
    </section>
    {#if assignment.participants.length > 1}
      <section>
        <h2 class="!mb-0">Gruppemedlemmer</h2>
        <ul>
          {#each assignment.participants as participant}
            <li>{participant.name}</li>
          {/each}
        </ul>
      </section>
    {/if}
    <section>
      <h2 class="!mb-0">Afleveringer</h2>
      <p>
        Afleveringsfrist {assignment.date > DateTime.now() ? "er" : "var"}
        {assignment.date.toLocaleString(DateTime.DATETIME_MED)} ({assignment.date.toRelative()})
      </p>
      {#if assignment.documents.length > 0}
        {#each assignment.documents as document}
          <a class="no-underline" href={document.url}>
            <Card class="mb-4">
              <CardHeader>
                <CardTitle class="flex items-center"
                  >{document.name}<Download class="ml-2" size="20" /></CardTitle
                >
                <CardDescription>
                  {document.user.name}
                  <br />
                  {document.date.toLocaleString(DateTime.DATETIME_MED)}
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        {/each}
      {:else}
        Ingen afleveringer endnu.
      {/if}
    </section>
  {/if}
</div>
