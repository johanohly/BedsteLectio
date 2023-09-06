<!-- 
Derived from SkeletonUI:  https://github.com/skeletonlabs/skeleton/blob/master/packages/skeleton/src/lib/utilities/LightSwitch/LightSwitch.svelte
 -->

<script lang="ts">
  import { onMount } from "svelte";
  import {
    getModeOsPrefers,
    modeCurrent,
    setModeCurrent,
    setModeUserPrefers,
  } from "./light-switch";
  import { createSwitch, melt } from "@melt-ui/svelte";

  $: {
    setModeUserPrefers($modeCurrent);
    setModeCurrent($modeCurrent);
  }

  const {
    elements: { root, input },
  } = createSwitch({ checked: modeCurrent });

  // Lifecycle
  onMount(() => {
    // Sync lightswitch with the theme
    if (!("modeCurrent" in localStorage)) {
      setModeCurrent(getModeOsPrefers());
    }
  });
</script>

<form>
  <div class="flex items-center justify-between">
    <label
      class="cursor-pointer"
      for="dark-mode"
    >
      Dark Mode
    </label>
    <button
      use:melt={$root}
      class="relative h-6 w-11 rounded-full bg-dark-hover dark:bg-light-hover transition-colors data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
      id="dark-mode"
    >
      <span
        class="block h-5 w-5 translate-x-0.5 rounded-full bg-white dark:bg-black
                transition-transform will-change-transform
                {!$modeCurrent && 'translate-x-[22px]'}"
      />
    </button>
    <input use:melt={$input} />
  </div>
</form>
