<script lang="ts">
  import { RequestData } from "$components";
  import { addToast } from "$components/toaster";
  import { authStore } from "$lib/stores";
  import { Loader2 } from "lucide-svelte";

  let loading = true;
  let submitting = false;
  let terminer: { selected: string; terminer: { [key: string]: string } };

  async function save() {
    submitting = true;
    const res = await fetch(`https://api.bedstelectio.dk/aendre_termin?id=${terminer.selected}`, {
      headers: {
        "lectio-cookie": $authStore.cookie,
      },
    });
    const data = await res.json();
    submitting = false;
    if (!res.ok || data.success == false) {
      return addToast({
        data: {
          color: "bg-red-500",
          description: "Der skete en ukendt fejl.",
          title: "Fejl",
        },
      });
    }

    addToast({
      data: {
        color: "bg-green-500",
        description: `Terminen er nu ændret til ${terminer.selected}.`,
        title: "Termin ændret",
      },
    });
  }
</script>

<RequestData bind:data={terminer} bind:loading path="terminer" />

<section>
  <h2 class="mt-0">Termin</h2>
  <p>Her kan du se og redigere din aktive termin.</p>
  <div class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400">
    <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
      <h4 class="mt-0">Skoleår</h4>
      <p class="text-sm">Her kan du manuelt ændre dit aktive skoleår.</p>
      {#if loading}
        <Loader2 class="animate-spin w-6 h-6 text-gray-500" />
      {:else}
        <div class="flex flex-row space-x-2">
          {#each Object.entries(terminer.terminer) as termin}
            {@const [key, value] = termin}
            <button
              class="bg-light hover:bg-light-hover dark:bg-dark dark:hover:bg-dark-hover font-bold py-2 px-4 rounded {key === terminer.selected ? '!bg-black dark:!bg-white text-white dark:text-black' : ''}"
              on:click={() => {
                terminer.selected = key;
              }}
            >
              {value}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
      <p class="my-0 text-gray-500">Gælder kun indtil næste login.</p>
      <div class="flex items-center justify-end ml-auto">
        <button on:click={save} disabled={loading || submitting} class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed">Gem</button>
      </div>
    </footer>
  </div>
</section>
