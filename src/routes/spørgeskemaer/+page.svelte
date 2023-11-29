<script lang="ts">
  import { RequestData } from "$components";
  import { Badge } from "$components/ui/badge";
  import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "$components/ui/card";
  import { Skeleton } from "$components/ui/skeleton";
  import type { RawSimpleForm, SimpleForm } from "$lib/types/forms";
  import { relativeTime } from "$lib/utilities";
  import { DateTime } from "luxon";

  let loading = true;
  let data: { åbne_for_besvarelse: RawSimpleForm[] };
  let forms: SimpleForm[];
  $: if (!loading && data) {
    forms = data.åbne_for_besvarelse.map((form) => ({
      title: form.titel,
      deadline: DateTime.fromFormat(form.svarfrist, "d/M-yyyy HH:mm", {
        locale: "da",
      }),
      anonymous: form.anonym === "Ja",
      owner: form.ejer,
      id: form.id,
    }));
  }

  $: filteredForms = forms;
</script>

<RequestData bind:loading bind:data path="spoergeskemaer" />

<div class="page-container">
  <div class="flex flex-col">
    <h1>Spørgeskemaer</h1>
    {#if loading}
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px] mb-4" />
      <Skeleton class="w-full h-36 rounded-[10px]" />
    {:else if filteredForms.length}
      {#each filteredForms as form}
        <div class="not-prose">
          <a href={`/spørgeskema/${form.id}`}>
            <Card class="mb-4">
              <CardHeader>
                <CardTitle>{form.title}<span class="hidden lg:block text-sm font-medium ml-2 px-2.5 py-0.5 rounded {form.anonymous ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}">{form.anonymous ? "Anonym" : "Ikke Anonym"}</span></CardTitle>
                <CardDescription>{form.owner}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge>Svarfrist &nbsp;<span use:relativeTime={form.deadline.toJSDate()} /></Badge>
              </CardFooter>
            </Card>
          </a>
        </div>
      {/each}
    {:else}
      Ingen spørgeskemaer
    {/if}
  </div>
</div>
