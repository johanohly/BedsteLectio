<script lang="ts">
  import { goto } from "$app/navigation";
  import { RequestData } from "$components";
  import { addToast } from "$components/toaster";
  import { Avatar } from "$components/ui/avatar";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$components/ui/card";
  import { Skeleton } from "$components/ui/skeleton";
  import type { Form, RawForm } from "$lib/types/forms";
  import { Loader2, Send } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { authStore } from "$lib/stores";

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

  let sending = false;
  const sendResponse = async () => {
    sending = true;
    await new Promise((r) => setTimeout(r, 2000));
    sending = false;
    return addToast({
      data: {
        title: "Svar ikke sendt!",
        description: "Besvarelse af spørgeskemaer er ikke muligt for tiden.",
        color: "bg-yellow-500",
      }
    })
    const resp = await fetch(`https://api.bedstelectio.dk/besvar_spoergeskema?id=${data.id}`, {
      method: "POST",
      headers: {
        "lectio-cookie": $authStore.cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ besvarelser: response }),
    });
    sending = false;
    if (resp.ok) {
      addToast({
        data: {
          title: "Svar sendt!",
          description: "Dit svar er nu sendt til spørgeskemaet.",
          color: "bg-green-500",
        },
      });
      goto("/spørgeskemaer", { replaceState: true });
    } else {
      addToast({
        data: {
          title: "Fejl!",
          description: "Der skete en fejl under afsendelsen af dit svar.",
          color: "bg-red-500",
        },
      });
    }
  };
</script>

<RequestData bind:loading bind:data={formData} path={`spoergeskema?id=${data.id}`} />

<div class="page-container">
  {#if loading}
    <div class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between">
      <Skeleton class="mb-0 h-[2.25em] w-3/4" />
      <Skeleton class="max-md:mb-1 h-8 w-24 rounded-[6px]" />
    </div>
    <div class="flex items-center space-x-2 !mt-1">
      <Skeleton class="h-5 w-5 rounded-full" />
      <Skeleton class="h-5 w-1/4" />
    </div>
    <Skeleton class="h-48 w-full" />
    <Skeleton class="h-48 w-full" />
    <Skeleton class="h-48 w-full" />
  {:else}
    <div class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between">
      <h1 class="!mb-0">{form.title}</h1>
      <button disabled={sending} on:click={sendResponse} class="flex items-center h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black">
        {#if sending}<Loader2 class="animate-spin mr-2 h-4 w-4" />{/if}
        Indsend ({form.anonymous ? "anonymt" : "ikke anonymt"})
        {#if !sending}<Send class="ml-2 h-4 w-4" />{/if}
      </button>
    </div>
    <div class="flex items-center space-x-2 !mt-0">
      <Avatar user={form.owner} size="h-5 w-5" popout />
      <p class="m-0">{form.owner.name}</p>
    </div>
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
        {#if question.type}
          <CardContent>
            {#if question.type === "tekstfelt"}
              <textarea class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Skriv dit svar her..." bind:value={response[question.id]} />
            {:else if question.type === "radio" && question.id}
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
