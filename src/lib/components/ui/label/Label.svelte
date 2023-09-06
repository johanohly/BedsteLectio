<script lang="ts">
  import { createLabel, melt } from "@melt-ui/svelte";
  import { cva } from "class-variance-authority";
  import { cn } from "$lib/utils";

  const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  );

  let className: undefined | string | null = undefined;
  export { className as class };

  const {
    elements: { root },
  } = createLabel();
</script>

<label class={cn(labelVariants(), className)} use:melt={$root} {...$$restProps}>
  <slot />
</label>
