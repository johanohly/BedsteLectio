<script lang="ts">
  import type { AfterNavigate } from "@sveltejs/kit";

  import { setInitialClassState } from "$components/light-switch/light-switch";
  import { afterNavigate } from "$app/navigation";
  import { Toaster } from "$components/toaster";
  import { SiteHeader } from "$components";
  import { page } from "$app/stores";

  import "../lib/utilities/string";
  import "../app.postcss";

  $: title =
    $page.url.pathname == "/"
      ? "BedsteLectio"
      : `${$page.url.pathname
          .split("/")[1]
          .replace("-", " ")
          .toTitleCase()} - BedsteLectio`;

  function scrollHeadingIntoView(): void {
    if (!window.location.hash) return;
    const elemTarget: HTMLElement | null = document.querySelector(
      window.location.hash
    );
    if (elemTarget) elemTarget.scrollIntoView({ behavior: "smooth" });
  }

  // Lifecycle
  afterNavigate((params: AfterNavigate) => {
    // Scroll to top
    const isNewPage =
      params.from && params.to && params.from.route.id !== params.to.route.id;
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
  <meta
    content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. "
    name="description"
  />
  <meta
    content="bedstelectio, betterlectio, lectio, studieadministration, skoleskema, karakterer, fravær, beskeder, brugervenlig, æstetisk, intuitiv, pæn, overskuelig"
    name="keywords"
  />
  <meta name="theme-color" content="#ffffff" />
  <meta content="Johnny JTH" name="author" />
  <!-- Open Graph - https://ogp.me/ -->
  <meta property="og:site_name" content="BedsteLectio" />
  <meta property="og:type" content="website" />
  <meta
    content="https://bedstelectio.tech{$page.url.pathname}"
    property="og:url"
  />
  <meta property="og:locale" content="da_DK" />
  <meta property="og:title" content={title} />
  <meta
    content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. "
    property="og:description"
  />
  <meta
    content="https://bedstelectio.tech/favicon-dark.png"
    property="og:image"
  />
  <meta
    content="https://bedstelectio.tech/favicon-dark.png"
    property="og:image:secure_url"
  />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="256" />
  <meta property="og:image:height" content="256" />

  <!-- This causes the new eslint-plugin-svelte: https://github.com/sveltejs/eslint-plugin-svelte/issues/492 -->
  {@html `<\u{73}cript nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})();</script>`}
</svelte:head>

<Toaster />
<SiteHeader />
<div class="prose dark:prose-invert max-w-none" id="page">
  <slot />
</div>
