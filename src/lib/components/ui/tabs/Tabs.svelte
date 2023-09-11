<script lang="ts">
  import { type Writable, writable } from "svelte/store";

  let originalTabs: string[] = [];
  export { originalTabs as tabs };
  export let defaultActive = "";
  export let selectedTab = writable(defaultActive);
  $: selectedTab.set(tabs[$selectedTabIndex]?.label ?? "");

  $: tabs = originalTabs.map((tab) => ({
    label: tab,
  }));

  let navRef: HTMLElement;
  $: navRect = navRef?.getBoundingClientRect();

  const hoveredRect: Writable<DOMRect | null> = writable(null);
  const hoveredTabIndex: Writable<null | number> = writable(null);
  const selectedTabIndex = writable(0);

  $: selectedRect =
    $buttonRefs[$selectedTabIndex]?.getBoundingClientRect() ?? null;
  const buttonRefs: Writable<Array<HTMLButtonElement>> = writable([]);

  const isInitialHoveredElement = writable(true);
  let isInitialRender = true;

  const onLeaveTabs = () => {
    isInitialHoveredElement.set(true);
    hoveredTabIndex.set(null);
  };

  const onEnterTab = (e: FocusEvent | PointerEvent, i: number) => {
    if (!e.target || !(e.target instanceof HTMLButtonElement)) return;

    hoveredTabIndex.update((prev) => {
      if (prev != null && prev !== i) {
        isInitialHoveredElement.set(false);
      }

      return i;
    });
    hoveredRect.set(e.target.getBoundingClientRect());
  };

  const onSelectTab = (i: number) => {
    selectedTabIndex.set(i);
  };

  let hoverStyles = "opacity: 0;";
  $: if (navRect && $hoveredRect) {
    hoverStyles = `transform: translate3d(${
      $hoveredRect.left - navRect.left
    }px,${$hoveredRect.top - navRect.top}px,0px);`;
    hoverStyles += `width: ${$hoveredRect.width}px;`;
    hoverStyles += `height: ${$hoveredRect.height}px;`;
    hoverStyles += `opacity: ${$hoveredTabIndex != null ? 1 : 0};`;
    hoverStyles +=
      "transition: " +
      ($isInitialHoveredElement
        ? `opacity 150ms;`
        : `transform 150ms 0ms, opacity 150ms 0ms, width 150ms;`);
  }

  let selectStyles = "opacity: 0;";
  $: if (navRect && selectedRect) {
    selectStyles = `width: ${selectedRect.width * 0.8}px;`;
    selectStyles += `transform: translateX(calc(${
      selectedRect.left - navRect.left
    }px + 10%));`;
    selectStyles += "opacity: 1;";
    selectStyles +=
      "transition: " +
      (isInitialRender
        ? `opacity 150ms 150ms;`
        : `transform 150ms 0ms, opacity 150ms 150ms, width 150ms;`);

    isInitialRender = false;
  }
</script>

<nav
  bind:this={navRef}
  class="flex flex-shrink-0 items-center relative z-0 py-2"
  on:pointerleave={onLeaveTabs}
>
  {#each tabs as tab, i}
    <button
      bind:this={$buttonRefs[i]}
      class="text-md relative rounded-md flex items-center h-8 px-4 z-20 bg-transparent text-base text-slate-500 dark:text-slate-400 cursor-pointer select-none transition-colors {$hoveredTabIndex ===
        i || $selectedTabIndex === i
        ? '!text-black dark:!text-white'
        : ''}"
      id={String(i)}
      on:click={() => onSelectTab(i)}
      on:focus={(e) => onEnterTab(e, i)}
      on:pointerenter={(e) => onEnterTab(e, i)}
    >
      {tab.label}
    </button>
  {/each}
  <div
    class="hidden lg:block absolute z-10 top-0 left-0 rounded-md bg-gray-200 dark:bg-dark-hover transition-[width]"
    style={hoverStyles}
  />
  <div
    class="absolute z-10 bottom-0 left-0 h-0.5 bg-black dark:bg-white"
    style={selectStyles}
  />
</nav>
