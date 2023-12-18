<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { addToast } from "$components/toaster";
  import { Button } from "$components/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$components/ui/card";
  import { FancyInput } from "$components/ui/fancyinput";
  import { Label } from "$components/ui/label";
  import { SchoolSelect } from "$components/ui/schoolselect";
  import { Switch } from "$components/ui/switch";
  import { authStore } from "$lib/stores";
  import { constructNonceURL } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { Loader, School } from "lucide-svelte";
  import { DateTime } from "luxon";
  import posthog from "posthog-js";
  import { onMount } from "svelte";

  let saveSchool = true;
  $: if (saveCredentials) {
    saveCredentials = saveCredentials; // reactivity :)
    saveSchool = true;
  }
  let saveCredentials = false;

  let schools: { [k: string]: number } = {};
  let school = 0;
  let redirectTo = "/";
  onMount(async () => {
    const tempSchools = (await fetch("https://api.bedstelectio.dk/skoler").then((res) => res.json())) as { id: number; skole: string }[];
    schools = {};
    for (const item of tempSchools) {
      schools[item.skole] = +item.id;
    }
    school = $authStore.school;

    const params = $page.url.searchParams;
    if (params.has("redirect")) {
      redirectTo = params.get("redirect") ?? "/";
      goto("/log-ind");
    }
  });

  let username = "";
  let password = "";
  let loading = false;
  async function login() {
    loading = true;
    const response = await fetch(constructNonceURL("https://api.bedstelectio.dk/auth"), {
      headers: {
        adgangskode: password,
        brugernavn: username,
        skoleid: String(school),
      },
    });
    if (response.ok) {
      if (saveSchool) $authStore.school = school;
      if (saveCredentials) {
        $authStore.username = username;
        $authStore.password = password;
      }
      $authStore.cookie = response.headers.get("set-lectio-cookie") ?? "";
      $authStore.lastLogin = DateTime.now().toISO();
      loading = false;
      posthog.identify(
        decodeUserID($authStore.cookie),
        {},
        {
          username: username,
          school: school,
        },
      );
      posthog.capture("login");
      return goto(redirectTo);
    }
    username = "";
    password = "";
    addToast({
      data: {
        color: "bg-red-500",
        description: "Dit brugernavn, kodeord eller din skole er forkert.",
        title: "Forkert login",
      },
    });
    loading = false;
  }
</script>

<div class="page-container">
  <div class="md:flex">
    <div class="hidden md:flex flex-col justify-between mr-auto not-prose">
      <div class="xl:space-y-4">
        <div class="text-black font-semibold text-2xl leading-8 items-center inline-flex max-xl:mb-10">
          <School class="w-8 h-8 mr-2" />
          <h1>BedsteLectio</h1>
        </div>
        <div class="flex">
          <svg class="text-blue-500 min-w-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          <div>
            <h3 class="text-black text-xl font-bold leading-4 mb-2">Hurtigere overblik af dit skema</h3>
            <p class="text-gray-600 mb-2">Unikke farver for hvert hold sikrer, at du kan kende forskel hurtigere. Er farverne ikke for dig, kan du manuelt ændre individuelle holds farver.</p>
          </div>
        </div>
        <div class="flex">
          <svg class="text-blue-500 min-w-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          <div>
            <h3 class="text-black text-xl font-bold leading-4 mb-2">Se dine opgaver</h3>
            <p class="text-gray-600 mb-2">Få et hurtigt overblik over alle dine kommende opgaver. Filtrér efter, om opgaver har fået feedback fra læreren.</p>
          </div>
        </div>
        <div class="flex">
          <svg class="text-blue-500 min-w-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          <div>
            <h3 class="text-black text-xl font-bold leading-4 mb-2">Få styr på dit fravær</h3>
            <p class="text-gray-600 mb-2">Visualiser dit fravær med forskellige grafer, eller regn ud, hvor meget fravær du kan få, for at blive under en bestemt procent.</p>
          </div>
        </div>
        <div class="flex">
          <svg class="text-blue-500 min-w-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          <div>
            <h3 class="text-black text-xl font-bold leading-4 mb-2">Planlæg dine lektier</h3>
            <p class="text-gray-600 mb-2">Se de næste 14 dages lektier i en oversigt.</p>
          </div>
        </div>
        <div class="flex">
          <svg class="text-blue-500 min-w-[1.25rem] max-w-[1.25rem] max-h-[1.25rem] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          <div>
            <h3 class="text-black text-xl font-bold leading-4 mb-2">Og meget mere...</h3>
            <p class="text-gray-600 mb-2">Alle essentielle lectio funktioner er understøttet, og du vil også finde nogle nye.</p>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <div class="md:hidden text-black font-semibold text-2xl leading-8 items-center inline-flex mb-6 not-prose">
        <School class="w-8 h-8 mr-2" />
        <h1>BedsteLectio</h1>
      </div>
    </div>
    <Card class="md:min-w-[45vw] xl:min-w-[30vw] md:ml-10">
      <CardHeader>
        <CardTitle class="text-xl mb-0">Velkommen</CardTitle>
        <CardDescription>Log ind med din Lectio konto her.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">Brugernavn</Label>
          <FancyInput autocomplete="username" bind:value={username} id="username" type="text" />
        </div>
        <div class="grid gap-2">
          <Label for="password">Kodeord</Label>
          <FancyInput autocomplete="current-password" bind:value={password} id="password" type="password" />
        </div>
        <div class="grid gap-2">
          <Label for="school">Skole</Label>
          <SchoolSelect bind:value={school} {schools} />
        </div>
        <div class="mt-4 flex items-center justify-between space-x-2">
          <Label class="flex flex-col space-y-1" for="save-school">
            <span>Gem Skole</span>
            <span class="font-normal leading-snug text-muted-foreground"> Gem skolen, så du ikke behøver at vælge den næste gang du logger ind. </span>
          </Label>
          <Switch bind:checked={saveSchool} disabled={saveCredentials} title="Gem Skole" id="save-school" />
        </div>
        <div class="mt-4 flex items-center justify-between space-x-2">
          <Label class="flex flex-col space-y-1" for="save-credentials">
            <span>Gem Oplysninger</span>
            <span class="font-normal leading-snug text-muted-foreground"> Gem dine oplysninger i din browser, så du aldrig behøves at logge ind igen. </span>
          </Label>
          <Switch bind:checked={saveCredentials} title="Gem Oplysninger" id="save-credentials" />
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full" disabled={loading || !username || !password || !school} on:click={login}>
          {#if loading}
            <Loader class="mr-2" />
          {/if}
          Log ind
        </Button>
      </CardFooter>
    </Card>
  </div>
</div>
