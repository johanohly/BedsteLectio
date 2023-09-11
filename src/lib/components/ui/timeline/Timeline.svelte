<script lang="ts">
  import { cn } from "$lib/utils";

  let className: null | string | undefined = undefined;
  export { className as class };
</script>

<ol class={cn("relative border-l border-gray-200 dark:border-gray-700 list-none", className)}>
  <slot />
</ol>
