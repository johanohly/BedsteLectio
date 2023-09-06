<script lang="ts">
  import { cn } from "$lib/utils";

  let className: string | undefined | null = undefined;
  export { className as class };
</script>

<div
  class={cn(
    "rounded-lg border dark:border-none bg-card dark:bg-dark text-card-foreground shadow-sm",
    className
  )}
  {...$$restProps}
  on:click
  on:focusin
  on:focusout
  on:mouseenter
  on:mouseleave
>
  <slot />
</div>
