<script lang="ts">
  import { Calendar } from "lucide-svelte";

  let className: string | undefined | null = undefined;
  export { className as class };

  export let title: string;
  export let titleNote: string | undefined = undefined;
  export let time: string;
  export let description: string;
  export let link: string | undefined = undefined;
</script>

<li class={className}>
  <a href={link} class="no-underline">
    <span
      class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-0 dark:bg-blue-900"
    >
      <Calendar class="w-4 h-4 text-blue-800 dark:text-blue-300" />
    </span>
    <h3
      class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white"
    >
      {title}
      {#if titleNote}<span
          class="hidden lg:block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ml-3"
          >{titleNote}</span
        >{/if}
    </h3>
    <time
      class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
      >{time}</time
    >
    <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
      {@html description}
    </p>
  </a>
</li>
