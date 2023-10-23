<script>
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";
  import { School } from "lucide-svelte";

  import { mainNavItems, subNavItems } from "./links";
  import { createDropdownMenu, melt } from "@melt-ui/svelte";
  import { fly } from "svelte/transition";

  const {
    elements: { trigger, menu, item, arrow },
    states: { open },
  } = createDropdownMenu({
    forceVisible: true,
  });
</script>

<div class="mr-4 hidden md:flex">
  <a class="mr-6 flex items-center space-x-2" href="/">
    <School />
    <span class="hidden font-bold sm:inline-block">BedsteLectio</span>
  </a>
  {#if $page.url.pathname !== "/log-ind"}
    <nav class="flex items-center space-x-6 text-sm font-medium">
      {#each mainNavItems as navItem}
        <a class={cn("transition-colors hover:text-foreground/80", decodeURI($page.url.pathname) === navItem.href ? "text-foreground" : "text-foreground/60")} href={navItem.href} rel={navItem.external ? "noreferrer" : undefined} target={navItem.external ? "_blank" : undefined}>
          {navItem.title}
        </a>
      {/each}
      <button
        class={cn(
          "transition-colors hover:text-foreground/80 not-prose",
          subNavItems
            .map((item) => {
              return item.href;
            })
            .includes(decodeURI($page.url.pathname))
            ? "text-foreground"
            : "text-foreground/60"
        )}
        use:melt={$trigger}>Andet</button
      >
    </nav>
  {/if}
</div>

{#if $open}
  <div use:melt={$menu} transition:fly={{ duration: 150, y: -10 }} class="z-50 flex flex-col max-h-[300px] lg:max-h-none min-w-[220px] shadow-lg rounded-md bg-white dark:bg-dark p-2 !ring-0">
    {#each subNavItems as navItem}
      <a use:melt={$item} class={cn("transition-colors py-1 px-4 rounded-md hover:bg-gray-300d dark:hover:bg-dark-hover hover:text-black dark:hover:text-white", decodeURI($page.url.pathname) === navItem.href ? "text-foreground" : "text-foreground/60")} href={navItem.href} rel={navItem.external ? "noreferrer" : undefined} target={navItem.external ? "_blank" : undefined}>
        {navItem.title}
      </a>
    {/each}
    <div use:melt={$arrow} />
  </div>
{/if}
