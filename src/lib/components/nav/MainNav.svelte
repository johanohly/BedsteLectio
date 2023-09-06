<script>
  import { School } from "lucide-svelte";
  import { page } from "$app/stores";
  import { cn } from "$lib/utils";

  import { navItems } from "./links";
</script>

<div class="mr-4 hidden md:flex">
  <a class="mr-6 flex items-center space-x-2" href="/">
    <School />
    <span class="hidden font-bold sm:inline-block">BedsteLectio</span>
  </a>
  <nav class="flex items-center space-x-6 text-sm font-medium">
    {#each navItems as navItem}
      <a
        class={cn(
          "transition-colors hover:text-foreground/80",
          $page.url.pathname === navItem.href
            ? "text-foreground"
            : "text-foreground/60"
        )}
        rel={navItem.external ? "noreferrer" : undefined}
        target={navItem.external ? "_blank" : undefined}
        href={navItem.href}
      >
        {navItem.title}
      </a>
    {/each}
  </nav>
</div>
