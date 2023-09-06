<script>
  import { cn } from "$lib/utils";
  import { School } from "lucide-svelte";
  import { navItems } from "./links";
  import { page } from "$app/stores";
</script>

<div class="mr-4 hidden md:flex">
  <a href="/" class="mr-6 flex items-center space-x-2">
    <School />
    <span class="hidden font-bold sm:inline-block">BedsteLectio</span>
  </a>
  <nav class="flex items-center space-x-6 text-sm font-medium">
    {#each navItems as navItem}
      <a
        href={navItem.href}
        class={cn(
          "transition-colors hover:text-foreground/80",
          $page.url.pathname === navItem.href
            ? "text-foreground"
            : "text-foreground/60"
        )}
        target={navItem.external ? "_blank" : undefined}
        rel={navItem.external ? "noreferrer" : undefined}
      >
        {navItem.title}
      </a>
    {/each}
  </nav>
</div>
