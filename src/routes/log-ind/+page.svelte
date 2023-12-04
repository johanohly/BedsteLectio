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
  import { Loader } from "lucide-svelte";
  import { DateTime } from "luxon";
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
    const tempSchools = (await fetch("https://api.bedstelectio.tech/skoler").then((res) => res.json())) as { id: number; skole: string }[];
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
    const response = await fetch(constructNonceURL("https://api.bedstelectio.tech/auth"), {
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

<div class="page-container h-full flex items-center justify-center">
  <Card class="w-full">
    <CardHeader>
      <CardTitle>Log ind</CardTitle>
      <CardDescription>Log ind med din Lectio konto nedenfor.</CardDescription>
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
        <Switch bind:checked={saveSchool} disabled={saveCredentials} name="Gem Skole" id="save-school" />
      </div>
      <div class="mt-4 flex items-center justify-between space-x-2">
        <Label class="flex flex-col space-y-1" for="save-credentials">
          <span>Gem Oplysninger</span>
          <span class="font-normal leading-snug text-muted-foreground"> Gem dine oplysninger i din browser, så du aldrig behøves at logge ind igen. </span>
        </Label>
        <Switch bind:checked={saveCredentials} name="Gem Oplysninger" id="save-credentials" />
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
