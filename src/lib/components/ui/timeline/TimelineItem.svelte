<script lang="ts">
  import { Calendar } from "lucide-svelte";

  let className: null | string | undefined = undefined;
  export { className as class };

  export let color = "#dbeafe";
  export let textColor = "#1e40af";
  export let title: string;
  export let titleNote: string | undefined = undefined;
  export let time: string;
  export let description: string;
  export let link: string | undefined = undefined;
</script>

<li class={className}>
  <a class="no-underline" href={link}>
    <span style:--color={color} style:--textColor={textColor} class="custom-color absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-0">
      <Calendar class="w-4 h-4" />
    </span>
    <h3 class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
      {title}
      {#if titleNote}<span style:--color={color} style:--textColor={textColor} class="custom-color hidden lg:block max-w-xs whitespace-nowrap overflow-hidden overflow-ellipsis text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3">{titleNote}</span>{/if}
    </h3>
    <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{time}</time>
    <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
      {@html description}
    </p>
  </a>
</li>

<style>
  .custom-color {
    background-color: var(--color);
    color: var(--textColor);
  }

  /* :is(.dark .custom-color) {
    background-color: var(--textColor);
    color: var(--color);
  } */
</style>
