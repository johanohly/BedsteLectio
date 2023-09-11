<script lang="ts">
  import type { Writable } from "svelte/store";

  import { page } from "$app/stores";
  import { cn } from "$lib/utils";

  export let href: string;
  export let open: Writable<boolean>;

  let className: null | string | undefined = undefined;
  export { className as class };
</script>

<a
  class={cn(
    $page.url.pathname === href ? "text-foreground" : "text-foreground/60",
    className
  )}
  {href}
  on:click={() => {open.set(false)}}
  {...$$restProps}
>
  <slot />
</a>
