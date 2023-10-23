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
        hasOptions: q.svar.type !== null,
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

  $: if (!loading && formData) console.log(formData.indhold[0]);
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
          <CardTitle class="mb-0">
            {question.title}
          </CardTitle>
          {#if question.description}
            <CardDescription>
              {question.description}
            </CardDescription>
          {/if}
        </CardHeader>
        {#if question.hasOptions}
        <CardContent>
          {#if question.type === "tekstfelt"}
            <textarea class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Skriv dit svar her..." bind:value={response[question.id]} />
          {:else if question.type === "radio"}
            <form>
              {#each question.options as option}
                <label>
                  <input class="accent-[#adffb9] dark:accent-[#8678f9]" type="radio" name={question.id} value={option.id} bind:group={response[question.id]} />
                  {option.value}
                  <br />
                </label>
              {/each}
            </form>
          {:else if question.type === "checkbox"}
            {#each question.options as option}
              <label>
                <input
                  on:change={(e) => {
                    if (!e.target) return;
                    // @ts-ignore
                    if (e.target.checked) response[option.id] = "on";
                    else {
                      delete response[option.id];
                      response = response;
                    }
                  }}
                  class="accent-[#adffb9] dark:accent-[#8678f9]"
                  type="checkbox"
                  name={question.id}
                  value={option.id}
                />
                {option.value}
                <br />
              </label>
            {/each}
          {/if}
        </CardContent>
        {/if}
      </Card>
    {/each}
  {/if}
</div>
