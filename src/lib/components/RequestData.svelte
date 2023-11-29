<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores";
  import { onMount } from "svelte";

  import { addToast } from "./toaster";
  import { constructNonceURL } from "$lib/utilities";
    import { page } from "$app/stores";

  export let path: string;
  export let onServerError = {
    active: false,
    path: "/log-ind",
    toast: {
      color: "bg-red-500",
      description: "Der skete en fejl på serveren.",
      title: "Serverfejl",
    },
    error: false,
  };
  export let withSettings = false;

  export let loading = true;
  export let data = {};
  export let settings: object = {};

  onMount(async () => {
    let response = await fetch(constructNonceURL(`https://api.bedstelectio.tech/${path}`), {
      headers: {
        "lectio-cookie": $authStore.cookie,
      },
    });
    if (!response.ok) {
      if (response.status == 500 && onServerError.active) {
        onServerError.error = true;
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
    data = await response.json();

    if (withSettings) {
      response = await fetch("/api/settings", {
        headers: {
          "lectio-cookie": $authStore.cookie,
        },
      });
      if (!response.ok) settings = {};
      else settings = await response.json();
    }

    loading = false;
  });
</script>
