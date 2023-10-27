<script lang="ts">
    import { goto } from "$app/navigation";
  import { addToast } from "$components/toaster";
  import { Confirm } from "$components/ui/confirm";
  import { authStore } from "$lib/stores";
  import { get } from "svelte/store";

  let cookie = get(authStore).cookie;

  const deleteData = async () => {
    const response = await fetch("/api/user", {
      method: "DELETE",
      headers: {
        "lectio-cookie": $authStore.cookie,
      },
    });
    if (!response.ok) {
      addToast({
        data: {
          title: "Fejl",
          description: "Der skete en fejl. Data kunne ikke slettes.",
          color: "bg-red-500",
        },
      });
    } else {
      $authStore.cookie = "";
      $authStore.username = "";
      $authStore.password = "";
      goto("/log-ind", { replaceState: true });

      addToast({
        data: {
          title: "Data slettet",
          description: "Dine data er nu blevet slettet.",
          color: "bg-green-500",
        },
      });
    }
  };
</script>

<section>
  <h2 class="mt-0">Generel</h2>
  <p>Her kan du se og redigere dine generelle oplysninger.</p>
  <div class="space-y-4">
    <div class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400">
      <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
        <h4 class="mt-0">Lectio Cookie</h4>
        <p class="text-sm">Dette er din Lectio Cookie, som bruges til at logge dig ind på Lectio. Hvis du ikke ved hvad det er, så lad være med at ændre den.</p>
        <input bind:value={cookie} class="w-full mt-2 border dark:border-gray-600 border-gray-400 rounded-[6px] p-2 bg-[inherit] dark:bg-[#2e2e2e]" placeholder={$authStore.cookie} type="text" />
      </div>
      <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
        <p class="my-0 text-gray-500">Lectio cookie er en base64-encoded string.</p>
        <div class="flex items-center justify-end ml-auto">
          <button
            class="h-8 px-3 rounded-[6px] bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cookie === "" || cookie === $authStore.cookie}
            on:click={() => {
              $authStore.cookie = cookie;
              addToast({
                data: {
                  color: "",
                  description: "Din cookie er nu blevet opdateret.",
                  title: "Cookie ændret",
                },
              });
            }}>Gem</button
          >
        </div>
      </footer>
    </div>
    <div class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400">
      <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
        <h4 class="mt-0">Slet Data</h4>
        <p class="text-sm">Hvis du vil slette alle dine data, som for eksempel dine hold farver, og blive logget ud, så kan du gøre det her.</p>
        <Confirm onConfirm={deleteData} />
      </div>
      <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
        <p class="my-0 text-gray-500">Denne handling kan ikke fortrydes.</p>
      </footer>
    </div>
  </div>
</section>
