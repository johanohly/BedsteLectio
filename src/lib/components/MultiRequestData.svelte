<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores";
  import { onMount } from "svelte";

  import { addToast } from "./toaster";
  import { constructNonceURL } from "$lib/utilities";
  import { page } from "$app/stores";
  import { decodeUserID } from "$lib/utilities/cookie";
  import posthog from "posthog-js";

  export let paths: string[];
  export let onServerError = {
    active: false,
    path: "/log-ind",
    toast: {
      color: "bg-red-500",
      description: "Der skete en fejl på serveren.",
      title: "Serverfejl",
    },
  };

  export let loading = true;
  export let data: { [key in (typeof paths)[number]]: object };

  onMount(async () => {
    for (const path of paths) {
      let response = await fetch(constructNonceURL(`https://api.bedstelectio.tech/${path}`), {
        headers: {
          "lectio-cookie": $authStore.cookie,
        },
      });
      if (!response.ok) {
        if (response.status == 500 && onServerError.active) {
          addToast({ data: onServerError.toast });
          return goto(onServerError.path);
        }
        if ($authStore.username != "" && $authStore.password != "") {
          response = await fetch(constructNonceURL("https://api.bedstelectio.tech/auth"), {
            headers: {
              adgangskode: $authStore.password,
              brugernavn: $authStore.username,
              skoleid: String($authStore.school),
            },
          });
          if (response.ok) {
            posthog.identify(
              decodeUserID($authStore.cookie),
              {},
              {
                username: $authStore.username,
                school: $authStore.school,
              },
            );
            console.log("Succesful auto-login");
            $authStore.cookie = response.headers.get("set-lectio-cookie") ?? "";
            response = await fetch(constructNonceURL(`https://api.bedstelectio.tech/${path}`), {
              headers: {
                "lectio-cookie": $authStore.cookie,
              },
            });
            if (!response.ok) {
              console.error("Failed data load after auto-login");
              $authStore.username = "";
              $authStore.password = "";
              $authStore.cookie = "";
              return goto(`/log-ind?redirect=${$page.url.pathname}`);
            }
          } else {
            console.error("Failed auto-login");
            $authStore.username = "";
            $authStore.password = "";
            $authStore.cookie = "";
            return goto(`/log-ind?redirect=${$page.url.pathname}`);
          }
        } else {
          $authStore.cookie = "";
          return goto(`/log-ind?redirect=${$page.url.pathname}`);
        }
      }
      data[path] = await response.json();
    }
    loading = false;

    for (const path of paths) {
      posthog.capture("Request data", { "Path": path });
    }
  });
</script>
