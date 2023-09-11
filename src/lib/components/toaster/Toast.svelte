<script lang="ts">
  import { type ToastsElements, createProgress, melt } from "@melt-ui/svelte";
  import { X } from "lucide-svelte";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { fly } from "svelte/transition";

  import { type ToastData, closeDelay } from "./Toaster.svelte";

  export let elements: ToastsElements;
  $: ({ close, content, description, title } = elements);
  export let data: ToastData;
  export let id: string;

  let created = performance.now();
  let progress = writable(0);

  const {
    elements: { root: progressEl },
    options: { max },
  } = createProgress({
    max: 100,
    value: progress,
  });

  onMount(() => {
    let unsub: number;
    const calcProgress = () => {
      const now = performance.now();
      if (hovering) {
        // Ease into now
        created = now - (now - created) * 0.75;
        if (now - created < 50) {
          created = now;
        }
      }
      const delta = now - created;
      $progress = 100 * (delta / closeDelay);
      if ($progress < 100) {
        unsub = requestAnimationFrame(calcProgress);
      }
    };
    unsub = requestAnimationFrame(calcProgress);
    return () => {
      cancelAnimationFrame(unsub);
    };
  });
  
  let hovering = false;
</script>

<div
  class="rounded-lg overflow-hidden bg-white dark:bg-dark text-foreground shadow-md"
  in:fly={{ duration: 150, x: "100%" }}
  on:pointerenter={() => (hovering = true)}
  on:pointerleave={() => (hovering = false)}
  out:fly={{ duration: 150, x: "100%" }}
  use:melt={$content(id)}
>
  <div
    class="relative h-1 rounded-full w-full overflow-hidden bg-[#dfdfdf] dark:bg-dark-hover"
    use:melt={$progressEl}
  >
    <div
      class="h-full w-full bg-[#f0f0f0] dark:bg-dark/80"
      style={`transform: translateX(-${
        100 - (100 * ($progress ?? 0)) / ($max ?? 1)
      }%)`}
    />
  </div>
  <div
    class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5"
  >
    <div>
      <h3 class="flex items-center gap-2 font-semibold" use:melt={$title(id)}>
        {data.title}
        <span class="rounded-full square-1.5 {data.color}" />
      </h3>
      <div use:melt={$description(id)}>
        {data.description}
      </div>
    </div>
    <button
      class="absolute right-4 top-4 grid place-items-center rounded-full text-foreground square-6
      hover:bg-[#dfdfdf] dark:hover:bg-dark-hover"
      use:melt={$close(id)}
    >
      <X class="square-4" />
    </button>
  </div>
</div>
