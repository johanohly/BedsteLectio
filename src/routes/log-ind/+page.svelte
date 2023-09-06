<script lang="ts">
  import { goto } from "$app/navigation";
  import { addToast } from "$components/toaster";
  import { Button } from "$components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$components/ui/card";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import { SchoolSelect } from "$components/ui/schoolselect";
  import { Switch } from "$components/ui/switch";
  import { authStore } from "$lib/stores";
  import { Loader } from "lucide-svelte";
  import { DateTime } from "luxon";
  import { onMount } from "svelte";

  let saveSchool = true;
  $: if (saveCredentials) {
    saveCredentials = saveCredentials; // reactivity :)
    saveSchool = true;
  }
  let saveCredentials = false;

  let schools: { [k: string]: any } = {};
  let school = 0;
  onMount(async () => {
    const tempSchools = (await fetch("https://api.betterlectio.dk/skoler").then(
      (res) => res.json()
    )) as { id: string; skole: string }[];
    schools = {};
    for (const item of tempSchools) {
      schools[item.skole] = item.id;
    }
    school = $authStore.school;
  });

  let username = "";
  let password = "";
  let loading = false;
  async function login() {
    loading = true;
    const response = await fetch("https://api.betterlectio.dk/auth", {
      headers: {
        brugernavn: username,
        adgangskode: password,
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
      return goto("/");
    }
    username = "";
    password = "";
    school = 0;
    addToast({
      data: {
        title: "Forkert login",
        description: "Dit brugernavn, kodeord eller din skole er forkert.",
        color: "bg-red-500",
      },
    });
    loading = false;
  }
</script>

<div class="page-container">
  <Card>
    <CardHeader>
      <CardTitle>Log ind</CardTitle>
      <CardDescription>Log ind med din Lectio konto nedenfor.</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid gap-2">
        <Label for="username">Brugernavn</Label>
        <Input
          bind:value={username}
          id="username"
          type="text"
          autocomplete="username"
        />
      </div>
      <div class="grid gap-2">
        <Label for="password">Kodeord</Label>
        <Input
          bind:value={password}
          id="password"
          type="password"
          autocomplete="current-password"
        />
      </div>
      <div class="grid gap-2">
        <Label for="school">Skole</Label>
        <SchoolSelect {schools} bind:value={school} />
        <!-- <Select options={schools} placeholder="Vælg din skole" bind:value={school} /> -->
      </div>
      <div class="mt-4 flex items-center justify-between space-x-2">
        <Label for="save-school" class="flex flex-col space-y-1">
          <span>Gem Skole</span>
          <span class="font-normal leading-snug text-muted-foreground">
            Gem skolen, så du ikke behøver at vælge den næste gang du logger
            ind.
          </span>
        </Label>
        <Switch
          id="save-school"
          bind:checked={saveSchool}
          disabled={saveCredentials}
        />
      </div>
      <div class="mt-4 flex items-center justify-between space-x-2">
        <Label for="save-credentials" class="flex flex-col space-y-1">
          <span>Gem Oplysninger</span>
          <span class="font-normal leading-snug text-muted-foreground">
            Gem dine oplysninger, så du ikke behøver at skrive dem næste gang du
            logger ind.
          </span>
        </Label>
        <Switch id="save-credentials" bind:checked={saveCredentials} />
      </div>
    </CardContent>
    <CardFooter>
      <Button
        on:click={login}
        disabled={loading || !username || !password || !school}
        class="w-full"
      >
        {#if loading}
          <Loader class="mr-2" />
        {/if}
        Log ind
      </Button>
    </CardFooter>
  </Card>
</div>
