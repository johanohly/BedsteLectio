<script lang="ts">
  import type { Writable } from "svelte/store";

  import { page } from "$app/stores";
  import { cn } from "$lib/utils";

  export let href: string;
  export let open: Writable<boolean>;

  let className: undefined | string | null = undefined;
  export { className as class };
</script>

<a
  class={cn(
    $page.url.pathname === href ? "text-foreground" : "text-foreground/60",
    className
  )}
  on:click={() => {open.set(false)}}
  {href}
  {...$$restProps}
>
  <slot />
</a>
