<script lang="ts">
  import { createCollapsible, createDialog, melt } from "@melt-ui/svelte";
  import { School, SidebarOpen } from "lucide-svelte";
  import { fade, fly, slide } from "svelte/transition";

  import MobileLink from "./MobileLink.svelte";
  import { mainNavItems, subNavItems } from "./links";
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";

  const {
    elements: { content, overlay, portalled, trigger },
    states: { open },
  } = createDialog();
  const {
    elements: { root: colRoot, content: colContent, trigger: colTrigger },
    states: { open: colOpen },
  } = createCollapsible();
</script>

<button class="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ring-offset-background hover:text-accent-foreground h-10 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden" use:melt={$trigger}>
  <SidebarOpen class="h-6 w-6" />
  <span class="sr-only">Toggle Menu</span>
</button>

<div use:melt={$portalled}>
  {#if $open}
    <div class="fixed inset-0 z-50 bg-background/50" transition:fade={{ duration: 150 }} use:melt={$overlay} />
    <div
      class="fixed left-0 top-0 z-50 h-screen w-full max-w-[350px] bg-background p-6
    shadow-lg border-r border-foreground/10 focus:outline-none"
      transition:fly={{
        duration: 300,
        opacity: 1,
        x: -350,
      }}
      use:melt={$content}
    >
      <MobileLink class="flex items-center !text-foreground" href="/" {open}>
        <School class="mr-2 h-4 w-4" />
        <span class="font-bold">BedsteLectio</span>
      </MobileLink>
      <div class="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-auto">
        <div class="flex flex-col space-y-3">
          {#each mainNavItems as navItem, index (navItem + index.toString())}
            {#if navItem.href}
              <MobileLink href={navItem.href} {open}>
                {navItem.title}
              </MobileLink>
            {/if}
          {/each}
          <div use:melt={$colRoot}>
            <button
              class={cn(
                "mb-3",
                subNavItems
                  .map((item) => {
                    return item.href;
                  })
                  .includes(decodeURI($page.url.pathname))
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
              use:melt={$colTrigger}>Andet</button
            >
            {#if $colOpen}
              <div use:melt={$colContent} transition:slide class="flex flex-col space-y-3">
                {#each subNavItems as navItem}
                  <MobileLink href={navItem.href} {open}>
                    {navItem.title}
                  </MobileLink>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
