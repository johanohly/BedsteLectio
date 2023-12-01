<script lang="ts">
  import type { AfterNavigate } from "@sveltejs/kit";

  import { afterNavigate } from "$app/navigation";
  import { navigating, page } from "$app/stores";
  import { Preloading, SiteFooter, SiteHeader } from "$components";
  import { Toaster } from "$components/toaster";

  import "../app.postcss";
  import "../lib/utilities/string";

  import "flatpickr/dist/flatpickr.css";
  import flatpickr from "flatpickr";
  import { Danish } from "flatpickr/dist/l10n/da.js";
  flatpickr.localize(Danish);

  $: title = $page.url.pathname == "/" ? "BedsteLectio" : `${$page.url.pathname.split("/").slice(-1)[0].replace("-", " ").toTitleCase()} - BedsteLectio`;

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
</script>

<svelte:head>
  <title>{title}</title>

  <!-- Meta Tags -->
  <meta content={title} name="title" />
  <meta content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. " name="description" />
  <meta content="bedstelectio, betterlectio, lectio, studieadministration, skoleskema, karakterer, fravær, beskeder, brugervenlig, æstetisk, intuitiv, pæn, overskuelig" name="keywords" />
  <meta content="#ffffff" name="theme-color" />
  <meta content="Johnny JTH" name="author" />
  <!-- Open Graph - https://ogp.me/ -->
  <meta content="BedsteLectio" property="og:site_name" />
  <meta content="website" property="og:type" />
  <meta content="https://bedstelectio.tech{$page.url.pathname}" property="og:url" />
  <meta content="da_DK" property="og:locale" />
  <meta content={title} property="og:title" />
  <meta content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. " property="og:description" />
  <meta content="https://bedstelectio.tech/favicon-dark.png" property="og:image" />
  <meta content="https://bedstelectio.tech/favicon-dark.png" property="og:image:secure_url" />
  <meta content="image/png" property="og:image:type" />
  <meta content="256" property="og:image:width" />
  <meta content="256" property="og:image:height" />
</svelte:head>

{#if $navigating}
  <Preloading />
{/if}

<Toaster />
<SiteHeader />
<div class="prose dark:prose-invert max-w-none" id="page">
  <slot />
</div>
{#if $page.url.pathname == "/log-ind"}
  <SiteFooter />
{/if}
