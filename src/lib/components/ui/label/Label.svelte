<script lang="ts">
  import { cn } from "$lib/utils";
  import { createLabel, melt } from "@melt-ui/svelte";
  import { cva } from "class-variance-authority";

  const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  );

  let className: null | string | undefined = undefined;
  export { className as class };

  const {
    elements: { root },
  } = createLabel();
</script>

<label class={cn(labelVariants(), className)} use:melt={$root} {...$$restProps}>
  <slot />
</label>
