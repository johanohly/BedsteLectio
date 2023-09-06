<script>
  import { LightSwitch } from "$components/light-switch";
  import { MainNav, MobileNav } from "./nav";
  import { Avatar } from "./ui/avatar";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { authStore } from "$lib/stores";
  import { createDropdownMenu, melt } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";

  const {
    elements: { trigger, menu, item, separator, arrow },
    states: { open },
  } = createDropdownMenu({
    forceVisible: true,
  });
</script>

<header
  class="bg-background/60 dark:bg-dark/60 sticky top-0 z-40 w-full border-b dark:border-white/10 shadow-sm backdrop-blur"
>
  <div class="container flex h-14 items-center">
    <MainNav />
    <MobileNav />
    <div class="flex flex-1 justify-end">
      <button use:melt={$trigger} type="button">
        <Avatar
          user={{
            id: decodeUserID($authStore.cookie),
            name: $authStore.username,
          }}
        />
      </button>
    </div>
  </div>
</header>

<div
  class="{!$open
    ? 'hidden'
    : ''} z-50 flex flex-col shadow-lg rounded-md bg-white dark:bg-dark-hover p-1 min-w-[220px] !ring-0"
  use:melt={$menu}
  transition:fly={{ duration: 100, y: -10 }}
>
  <a
    href="/konto"
    class="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark hover:text-gray-900 dark:hover:text-gray-100 block px-4 py-2 text-sm rounded-md"
    use:melt={$item}>Konto</a
  >
  <div
    class="cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark hover:text-gray-900 dark:hover:text-gray-100 block px-4 py-2 text-sm rounded-md"
    use:melt={$item}
  >
    <LightSwitch />
  </div>
  <div use:melt={$arrow} />
</div>
