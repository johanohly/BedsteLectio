<script lang="ts">
  import { page } from "$app/stores";

  const activeStyles = "text-black dark:text-white";
</script>

<div class="page-container">
  <h1 class="mb-0">Min Konto</h1>
  <div class="!mt-4 flex justify-start items-stretch flex-col md:flex-row">
    <div class="not-prose flex-row md:flex-col md:w-44">
      <a class="md:block py-2 px-3 ml-[-12px] text-[14px] rounded-[5px] transition-link text-[#7d7d7d] hover:bg-light-hover hover:text-black dark:hover:bg-dark-hover dark:hover:text-white {$page.url.pathname.endsWith('/konto/generel') ? activeStyles : ''}" href="/konto/generel">Generel</a>
      <a class="md:block py-2 px-3 ml-[-12px] text-[14px] rounded-[5px] transition-link text-[#7d7d7d] hover:bg-light-hover hover:text-black dark:hover:bg-dark-hover dark:hover:text-white {$page.url.pathname.endsWith('/konto/udseende') ? activeStyles : ''}" href="/konto/udseende">Udseende</a>
      <a class="md:block py-2 px-3 ml-[-12px] text-[14px] rounded-[5px] transition-link text-[#7d7d7d] hover:bg-light-hover hover:text-black dark:hover:bg-dark-hover dark:hover:text-white {$page.url.pathname.endsWith('/konto/termin') ? activeStyles : ''}" href="/konto/termin">Termin</a>
    </div>
    <div class="flex flex-1 max-md:mt-4 lg:ml-4">
      <main class="w-full">
        <slot />
      </main>
    </div>
  </div>
</div>

<style>
  .transition-link {
    transition: color 0.2s ease, background-color 0.2s ease;
  }
</style>
