<script lang="ts">
  import { addToast } from "$components/toaster";
  import { RequestData } from "$components";
  import { authStore } from "$lib/stores";

  let loading = true;
  let terminer: { terminer: { [key: string]: string }; selected: string };

  async function save() {
    const res = await fetch(
      `https://api.betterlectio.dk/aendre_termin?id=${terminer.selected}`,
      {
        headers: {
          "lectio-cookie": $authStore.cookie,
        },
      }
    );
    const data = await res.json();
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
        color: "",
        description: `Terminen er nu ændret til ${terminer.selected}.`,
        title: "Termin ændret",
      },
    });
  }
</script>

<RequestData bind:data={terminer} path="terminer" bind:loading />

<section>
  <h2 class="mt-0">Termin</h2>
  <p>Her kan du se og redigere din aktive termin.</p>
  {#if !loading}
    <div class="flex flex-row space-x-2">
      {#each Object.entries(terminer.terminer) as termin}
        {@const [key, value] = termin}
        <button
          class="bg-light hover:bg-light-hover dark:bg-dark dark:hover:bg-dark-hover font-bold py-2 px-4 rounded {key ===
          terminer.selected
            ? '!bg-black dark:!bg-white text-white dark:text-black'
            : ''}"
          on:click={() => {
            terminer.selected = key;
          }}
        >
          {value}
        </button>
      {/each}
    </div>
    <div class="mt-4">
      <button
        class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black"
        on:click={save}
        >Gem</button
      >
    </div>
  {:else}
    hehe
  {/if}
</section>
