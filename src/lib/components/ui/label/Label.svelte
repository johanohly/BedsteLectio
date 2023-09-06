<script lang="ts">
  import { cva } from "class-variance-authority";
  import { cn } from "$lib/utils";
  import { createLabel, melt } from "@melt-ui/svelte";

  const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  );

  let className: string | undefined | null = undefined;
  export { className as class };

  const {
    elements: { root },
  } = createLabel();
</script>

<label use:melt={$root} class={cn(labelVariants(), className)} {...$$restProps}>
  <slot />
</label>
