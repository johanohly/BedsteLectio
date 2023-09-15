<script lang="ts">
  import { authStore } from "$lib/stores";
  import { getInitials } from "$lib/utilities";
  import { createAvatar, melt } from "@melt-ui/svelte";
  import IntersectionObserver from "svelte-intersection-observer";

  let element: HTMLDivElement;

  export let user: {
    id: string;
    name: string;
  };
  const {
    elements: { fallback, image },
    options: { src },
  } = createAvatar();

  async function fetchImage() {
    const res = await fetch(`https://api.betterlectio.dk/profil_billed?id=${user.id}&fullsize=1`, {
      headers: {
        "lectio-cookie": $authStore.cookie,
      },
    });
    if (res.ok) {
      const text = await res.text();
      src.set(`data:image/png;base64, ${text}`);
    }
  }
</script>

<IntersectionObserver {element} on:intersect={fetchImage} once>
  <div bind:this={element} class="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden {!$fallback.hidden ? 'bg-dark-hover dark:bg-light-hover' : ''}">
    <img alt="Avatar" use:melt={$image} />
    <span class="text-2xl font-medium text-white dark:text-black" use:melt={$fallback}>{getInitials(user.name)}</span>
  </div>
</IntersectionObserver>
