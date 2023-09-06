<script lang="ts">
  import { page } from "$app/stores";
  import { SiteHeader } from "$components";
  import { setInitialClassState } from "$components/light-switch/light-switch";
  import "../lib/utilities/string";
  import "../app.postcss";
  import { afterNavigate } from "$app/navigation";
  import { Toaster } from "$components/toaster";

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
  afterNavigate((params: any) => {
    // Scroll to top
    const isNewPage: boolean =
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
  <meta name="title" content={title} />
  <meta
    name="description"
    content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. "
  />
  <meta
    name="keywords"
    content="bedstelectio, betterlectio, lectio, studieadministration, skoleskema, karakterer, fravær, beskeder, brugervenlig, æstetisk, intuitiv, pæn, overskuelig"
  />
  <meta name="theme-color" content="#ffffff" />
  <meta name="author" content="Johnny JTH" />
  <!-- Open Graph - https://ogp.me/ -->
  <meta property="og:site_name" content="BedsteLectio" />
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://bedstelectio.tech{$page.url.pathname}"
  />
  <meta property="og:locale" content="da_DK" />
  <meta property="og:title" content={title} />
  <meta
    property="og:description"
    content="BedsteLectio er en elegant og brugervenlig webside, der præsenterer data fra Lectio på en forbedret måde. "
  />
  <meta
    property="og:image"
    content="https://bedstelectio.tech/favicon-dark.png"
  />
  <meta
    property="og:image:secure_url"
    content="https://bedstelectio.tech/favicon-dark.png"
  />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="256" />
  <meta property="og:image:height" content="256" />

  <!-- This causes the new eslint-plugin-svelte: https://github.com/sveltejs/eslint-plugin-svelte/issues/492 -->
  {@html `<\u{73}cript nonce="%sveltekit.nonce%">(${setInitialClassState.toString()})();</script>`}
</svelte:head>

<Toaster />
<SiteHeader />
<div id="page" class="prose dark:prose-invert max-w-none">
  <slot />
</div>
