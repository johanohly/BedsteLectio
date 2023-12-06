<script lang="ts">
  import type { AfterNavigate } from "@sveltejs/kit";

  import { afterNavigate } from "$app/navigation";
  import { navigating, page } from "$app/stores";
  import { Preloading, SiteHeader } from "$components";
  import { Toaster } from "$components/toaster";

  import "../app.postcss";
  import "../lib/utilities/string";

  import "flatpickr/dist/flatpickr.css";
  import flatpickr from "flatpickr";
  import { Danish } from "flatpickr/dist/l10n/da.js";
  import { onMount } from "svelte";
  import posthog from "posthog-js";
  import { browser } from "$app/environment";
  flatpickr.localize(Danish);

  $: title = $page.url.pathname == "/" || $page.url.pathname == "/log-ind" ? "BedsteLectio" : `${$page.url.pathname.split("/").slice(-1)[0].replace("-", " ").toTitleCase()} - BedsteLectio`;

  function scrollHeadingIntoView(): void {
    if (!window.location.hash) return;
    const elemTarget: HTMLElement | null = document.querySelector(window.location.hash);
    if (elemTarget) elemTarget.scrollIntoView({ behavior: "smooth" });
  }

  // Lifecycle
  afterNavigate((params: AfterNavigate) => {
    // Scroll to top
    const isNewPage = params.from && params.to && params.from.route.id !== params.to.route.id;
    const elemPage = document.querySelector("#page");
    if (isNewPage && elemPage !== null) {
      elemPage.scrollTop = 0;
    }
    scrollHeadingIntoView();
  });

  let currentPath = "";
  onMount(() => {
    if (browser) {
      const unsubscribePage = page.subscribe(($page) => {
        if (currentPath && currentPath !== $page.url.pathname) {
          posthog.capture("$pageleave");
        }
        currentPath = $page.url.pathname;
        posthog.capture("$pageview");
      });

      const handleBeforeUnload = () => {
        posthog.capture("$pageleave");
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        unsubscribePage();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  });
</script>

<svelte:head>
  <title>{title}</title>

  <!-- Meta Tags -->
  <meta content={title} name="title" />
  <meta content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. " name="description" />
  <meta content="bedstelectio, bedste lectio, betterlectio, better lectio, lectio, lectio plus, mit lectio, studieadministration, skoleskema, karakterer, fravær, beskeder, brugervenlig, æstetisk, intuitiv, pæn, overskuelig" name="keywords" />
  <meta content="#ffffff" name="theme-color" />
  <meta content="Johnny JTH" name="author" />
  <!-- Open Graph - https://ogp.me/ -->
  <meta content="BedsteLectio" property="og:site_name" />
  <meta content="website" property="og:type" />
  <meta content="https://bedstelectio.dk{$page.url.pathname}" property="og:url" />
  <meta content="da_DK" property="og:locale" />
  <meta content={title} property="og:title" />
  <meta content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. " property="og:description" />
  <meta content="https://bedstelectio.dk/favicon-dark.png" property="og:image" />
  <meta content="https://bedstelectio.dk/favicon-dark.png" property="og:image:secure_url" />
  <meta content="image/png" property="og:image:type" />
  <meta content="256" property="og:image:width" />
  <meta content="256" property="og:image:height" />
</svelte:head>

{#if $navigating}
  <Preloading />
{/if}

<Toaster />
{#if $page.url.pathname !== "/log-ind"}
  <SiteHeader />
{/if}
<div class="prose dark:prose-invert max-w-none" id="page">
  <slot />
</div>
