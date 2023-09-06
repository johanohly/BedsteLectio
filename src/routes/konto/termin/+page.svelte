<script lang="ts">
  import { RequestData } from "$components";
  import { addToast } from "$components/toaster";
  import { authStore } from "$lib/stores";

  let loading = true;
  let terminer: { selected: string; terminer: { [key: string]: string } };

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
          title: "Fejl",
          description: "Der skete en ukendt fejl.",
          color: "bg-red-500",
        },
      });
    }

    addToast({
      data: {
        title: "Termin ændret",
        description: `Terminen er nu ændret til ${terminer.selected}.`,
        color: "",
      },
    });
  }
</script>

<RequestData bind:loading bind:data={terminer} path="terminer" />

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
        on:click={save}
        class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black"
        >Gem</button
      >
    </div>
  {:else}
    hehe
  {/if}
</section>
