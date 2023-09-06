<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";
  import type { VariantProps } from "class-variance-authority";

  import { cn } from "$lib/utils";

  import { buttonVariants } from ".";

  let className: undefined | string | null = undefined;
  export { className as class };
  export let href: HTMLAnchorAttributes["href"] = undefined;
  export let type: HTMLButtonAttributes["type"] = undefined;
  export let variant: VariantProps<typeof buttonVariants>["variant"] =
    "default";
  export let size: VariantProps<typeof buttonVariants>["size"] = "default";
</script>

<svelte:element
  class={cn(buttonVariants({ className, size, variant }))}
  type={href ? undefined : type}
  this={href ? "a" : "button"}
  {href}
  {...$$restProps}
  on:mouseenter
  on:mouseleave
  on:keydown
  on:change
  on:click
  on:keyup
>
  <slot />
</svelte:element>
