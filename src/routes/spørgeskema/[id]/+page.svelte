<script lang="ts">
  import { RequestData } from "$components";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$components/ui/card";
  import { Skeleton } from "$components/ui/skeleton";
  import type { Form, RawForm } from "$lib/types/forms";
  import type { PageData } from "./$types";

  export let data: PageData;

  let loading = true;
  let formData: RawForm;
  let form: Form;
  let response: Record<string, string> = {};
  $: if (!loading && formData) {
    form = {
      title: formData.titel,
      owner: {
        name: formData.afstender.navn,
        id: formData.afstender.id,
      },
      anonymous: formData.anonym,
      questions: formData.indhold.map((q) => ({
        type: q.svar.type,
        title: q.titel,
        description: q.tekst,
        id: q.svar.id,
        options: q.svar.muligheder.map((o) => ({
          id: o.id,
          value: o.tekst,
        })),
      })),
    };
  }

  const sendResponse = async () => {
    const resp = await fetch(`/besvar_spoergeskema?id=${data.id}`, {
      method: "POST",
      body: JSON.stringify(response),
    });
  };
</script>

<RequestData bind:loading bind:data={formData} path={`spoergeskema?id=${data.id}`} />

<div class="page-container">
  {#if loading}
    <Skeleton class="h-[2.25em] w-3/4" />
  {:else}
    <h1>{form.title}</h1>
    {#each form.questions as question}
      <Card>
        <CardHeader>
          <CardTitle>
            {question.title}
          </CardTitle>
          {#if question.description}
            <CardDescription>
              {question.description}
            </CardDescription>
          {/if}
        </CardHeader>
        <CardContent>
          {#if question.type === "tekstfelt"}
            <textarea class="w-full border" placeholder="Skriv dit svar her..." bind:value={response[question.id]} />
          {/if}
        </CardContent>
      </Card>
    {/each}
  {/if}
</div>
