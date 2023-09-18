<script lang="ts">
  import type { VariantProps } from "class-variance-authority";
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
  } from "svelte/elements";

  import { cn } from "$lib/utils";

  import { buttonVariants } from ".";

  let className: null | string | undefined = undefined;
  export { className as class };
  export let href: HTMLAnchorAttributes["href"] = undefined;
  export let target: HTMLAnchorAttributes["target"] = undefined;
  export let type: HTMLButtonAttributes["type"] = undefined;
  export let variant: VariantProps<typeof buttonVariants>["variant"] =
    "default";
  export let size: VariantProps<typeof buttonVariants>["size"] = "default";
</script>

<svelte:element
  class={cn(buttonVariants({ className, size, variant }))}
  {href}
  {target}
  this={href ? "a" : "button"}
  type={href ? undefined : type}
  {...$$restProps}
  on:change
  on:click
  on:keydown
  on:keyup
  on:mouseenter
  on:mouseleave
>
  <slot />
</svelte:element>
