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
  export let size = "h-10 w-10";
  export let popout = false;
  let poppedOut = false;

  const {
    elements: { fallback, image },
    options: { src },
  } = createAvatar();

  async function fetchImage() {
    const res = await fetch(`https://api.bedstelectio.tech/profil_billed?id=${user.id}&fullsize=1`, {
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
  <div
    bind:this={element}
    on:click={() => {
      if (popout) poppedOut = !poppedOut;
    }}
    class="flex flex-shrink-0 {popout ? 'cursor-pointer' : ''} {poppedOut ? 'h-32 w-32' : size} items-center justify-center rounded-full overflow-hidden {!$fallback.hidden ? 'bg-dark-hover dark:bg-light-hover' : ''}"
  >
    <img class="!m-0" alt="Avatar" use:melt={$image} />
    <span class="text-2xl font-medium text-white dark:text-black" use:melt={$fallback}>{getInitials(user.name)}</span>
  </div>
</IntersectionObserver>
