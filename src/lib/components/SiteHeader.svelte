<script>
  import { LightSwitch } from "$components/light-switch";
  import { authStore } from "$lib/stores";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { createDropdownMenu, melt } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";

  import { MainNav, MobileNav } from "./nav";
  import { Avatar } from "./ui/avatar";
  import { goto } from "$app/navigation";
  import { addToast } from "./toaster";
  import { page } from "$app/stores";
  import posthog from "posthog-js";
  import { clearAuthStore } from "$lib/utilities/http";

  const {
    elements: { arrow, item, menu, trigger },
    states: { open },
  } = createDropdownMenu();

  const signOut = () => {
    clearAuthStore();
    goto("/log-ind", { replaceState: true });

    addToast({
      data: {
        title: "Du er nu logget ud",
        description: "Du er nu logget ud af din konto",
        color: "bg-red-500",
      },
    });
    posthog.reset();
  };
</script>

<header class="bg-background/60 dark:bg-dark/60 sticky top-0 z-40 w-full border-b dark:border-white/10 shadow-sm backdrop-blur">
  <div class="container flex h-14 items-center">
    <MainNav />
    <MobileNav />
    {#if $page.url.pathname !== "/log-ind"}
      <div class="flex flex-1 justify-end">
        <button type="button" use:melt={$trigger}>
          <Avatar
            user={{
              id: `S${decodeUserID($authStore.cookie)}`,
              name: $authStore.username,
            }}
          />
        </button>
      </div>
    {/if}
  </div>
</header>

{#if $open}
  <div class="z-50 flex flex-col shadow-lg rounded-md bg-white dark:bg-dark dark:border p-1 min-w-[220px] !ring-0" transition:fly={{ duration: 100, y: -10 }} use:melt={$menu}>
    <div class="py-2 flex items-center justify-center">
      <Avatar
        user={{
          id: `S${decodeUserID($authStore.cookie)}`,
          name: $authStore.username,
        }}
        size="h-28 w-28"
      />
    </div>
    <div class="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-gray-100 block px-4 py-2 text-sm rounded-md" use:melt={$item}>
      <LightSwitch />
    </div>
    <a class="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-gray-100 block px-4 py-2 text-sm rounded-md" href="/konto" use:melt={$item}>Konto</a>
    <button on:click={signOut} class="text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-gray-100 block px-4 py-2 text-sm rounded-md" use:melt={$item}>Log ud</button>
    <div use:melt={$arrow} />
  </div>
{/if}
