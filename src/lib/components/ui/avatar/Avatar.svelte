<script lang="ts">
  import { createAvatar, melt } from "@melt-ui/svelte";
  import { getInitials } from "$lib/utilities";
  import { authStore } from "$lib/stores";
  import { onMount } from "svelte";

  export let user: {
    name: string;
    id: string;
  };
  const {
    elements: { fallback, image },
    options: { src },
  } = createAvatar();

  onMount(async () => {
    const res = await fetch(
      `https://api.betterlectio.dk/profil_billed?id=S${user.id}&fullsize=1`,
      {
        headers: {
          "lectio-cookie": $authStore.cookie,
        },
      }
    );
    if (res.ok) {
      const text = await res.text();
      src.set(`data:image/png;base64, ${text}`);
    }
  });
</script>

<div
  class="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-dark-hover dark:bg-light-hover"
>
  <img use:melt={$image} alt="Avatar" />
  <span
    class="text-2xl font-medium text-white dark:text-black"
    use:melt={$fallback}
    >{getInitials(user.name)}</span
  >
</div>
