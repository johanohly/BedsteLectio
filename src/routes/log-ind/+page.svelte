<script lang="ts">
  import {
    CardDescription,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Card,
  } from "$components/ui/card";
  import { SchoolSelect } from "$components/ui/schoolselect";
  import { addToast } from "$components/toaster";
  import { Button } from "$components/ui/button";
  import { Switch } from "$components/ui/switch";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import { authStore } from "$lib/stores";
  import { goto } from "$app/navigation";
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
  onMount(async () => {
    const tempSchools = (await fetch("https://api.betterlectio.dk/skoler").then(
      (res) => res.json()
    )) as { skole: string; id: number }[];
    schools = {};
    for (const item of tempSchools) {
      schools[item.skole] = +item.id;
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
      return goto("/");
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
  <Card>
    <CardHeader>
      <CardTitle>Log ind</CardTitle>
      <CardDescription>Log ind med din Lectio konto nedenfor.</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid gap-2">
        <Label for="username">Brugernavn</Label>
        <Input
          autocomplete="username"
          bind:value={username}
          id="username"
          type="text"
        />
      </div>
      <div class="grid gap-2">
        <Label for="password">Kodeord</Label>
        <Input
          autocomplete="current-password"
          bind:value={password}
          type="password"
          id="password"
        />
      </div>
      <div class="grid gap-2">
        <Label for="school">Skole</Label>
        <SchoolSelect bind:value={school} {schools} />
        <!-- <Select options={schools} placeholder="Vælg din skole" bind:value={school} /> -->
      </div>
      <div class="mt-4 flex items-center justify-between space-x-2">
        <Label class="flex flex-col space-y-1" for="save-school">
          <span>Gem Skole</span>
          <span class="font-normal leading-snug text-muted-foreground">
            Gem skolen, så du ikke behøver at vælge den næste gang du logger
            ind.
          </span>
        </Label>
        <Switch
          disabled={saveCredentials}
          bind:checked={saveSchool}
          id="save-school"
        />
      </div>
      <div class="mt-4 flex items-center justify-between space-x-2">
        <Label class="flex flex-col space-y-1" for="save-credentials">
          <span>Gem Oplysninger</span>
          <span class="font-normal leading-snug text-muted-foreground">
            Gem dine oplysninger, så du ikke behøver at skrive dem næste gang du
            logger ind.
          </span>
        </Label>
        <Switch bind:checked={saveCredentials} id="save-credentials" />
      </div>
    </CardContent>
    <CardFooter>
      <Button
        disabled={loading || !username || !password || !school}
        on:click={login}
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
