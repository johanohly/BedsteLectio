<script lang="ts">
  import { cn } from "$lib/utils";

  let className: undefined | string | null = undefined;
  export { className as class };
</script>

<div
  class={cn(
    "rounded-lg border dark:border-none bg-card dark:bg-dark text-card-foreground shadow-sm",
    className
  )}
  {...$$restProps}
  on:mouseenter
  on:mouseleave
  on:focusout
  on:focusin
  on:click
>
  <slot />
</div>
