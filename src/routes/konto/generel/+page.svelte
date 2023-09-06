<script lang="ts">
  import { addToast } from "$components/toaster";
  import { authStore } from "$lib/stores";
  import { get } from "svelte/store";

  let cookie = get(authStore).cookie;
</script>

<section>
  <h2 class="mt-0">Generel</h2>
  <p>Her kan du se og redigere dine generelle oplysninger.</p>
  <div
    class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400"
  >
    <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
      <h4 class="mt-0">Lectio Cookie</h4>
      <p class="text-sm">
        Dette er din Lectio Cookie, som bruges til at logge dig ind på Lectio.
        Hvis du ikke ved hvad det er, så lad være med at ændre den.
      </p>
      <input
        class="w-full mt-2 border dark:border-gray-600 border-gray-400 rounded-[6px] p-2 bg-[inherit] dark:bg-[#2e2e2e]"
        placeholder={$authStore.cookie}
        bind:value={cookie}
        type="text"
      />
    </div>
    <footer
      class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center"
    >
      <p class="my-0 text-gray-500">
        Lectio cookie er en base64-encoded string.
      </p>
      <div class="flex items-center justify-end ml-auto">
        <button
          on:click={() => {
            $authStore.cookie = cookie;
            addToast({
              data: {
                color: "",
                description: "Din cookie er nu blevet opdateret.",
                title: "Cookie ændret",
              },
            });
          }}
          class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cookie === "" || cookie === $authStore.cookie}
          >Gem</button
        >
      </div>
    </footer>
  </div>
</section>
