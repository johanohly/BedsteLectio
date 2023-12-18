<script lang="ts">
  import { cn } from "$lib/utils";
  import { createSwitch, melt } from "@melt-ui/svelte";

  let className: null | string | undefined = undefined;
  export { className as class };

  export let title = "button";
  export let disabled = false;
  export let checked = false;

  const {
    elements: { input, root },
    options: { disabled: rootDisabled },
    states: { checked: rootChecked },
  } = createSwitch({
    defaultChecked: checked,
  });
  $: rootDisabled.set(disabled);
  $: rootChecked.set(checked);
  rootChecked.subscribe((v) => {
    checked = v;
  });
</script>

<button {title} class={cn("peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)} use:melt={$root} {...$$restProps}>
  <span class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform will-change-transform {$rootChecked && 'translate-x-5'}" />
  <input use:melt={$input} />
</button>
