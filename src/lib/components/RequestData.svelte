<script lang="ts">
  import { goto } from "$app/navigation";
  import { SETTINGS_CACHE_DURATION, authStore, settingsStore } from "$lib/stores";
  import { onMount } from "svelte";

  import { addToast } from "./toaster";
  import { constructNonceURL } from "$lib/utilities";
  import { page } from "$app/stores";
  import posthog from "posthog-js";
  import type { Settings } from "$lib/types/settings";
  import { autoLogin, clearAuthStore } from "$lib/utilities/http";
  import { DateTime } from "luxon";

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
  export let settings: Settings = { customColors: {}, classNames: {} };

  onMount(async () => {
    let response = await fetch(constructNonceURL(`https://api.bedstelectio.dk/${path}`), {
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
        const success = await autoLogin();
        if (success) {
          response = await fetch(constructNonceURL(`https://api.bedstelectio.dk/${path}`), {
            headers: {
              "lectio-cookie": $authStore.cookie,
            },
          });
          if (!response.ok) {
            clearAuthStore();
            return goto(`/log-ind?redirect=${$page.url.pathname}`);
          }
        } else {
          clearAuthStore();
          return goto(`/log-ind?redirect=${$page.url.pathname}`);
        }
      } else {
        $authStore.cookie = "";
        return goto(`/log-ind?redirect=${$page.url.pathname}`);
      }
    }
    data = await response.json();

    if (withSettings) {
      if (!$settingsStore.age || ($settingsStore.age && Math.abs(DateTime.fromISO($settingsStore.age).diffNow().as("days")) > SETTINGS_CACHE_DURATION)) {
        const response = await fetch("/api/settings", {
          headers: {
            "lectio-cookie": $authStore.cookie,
          },
        });
        if (!response.ok) {
          settings = { customColors: {}, classNames: {} };
        } else {
          settings = await response.json();
        }
        settingsStore.set({
          age: DateTime.now().toISO(),
          settings: settings,
        });
      } else {
        settings = $settingsStore.settings;
      }
    }

    loading = false;

    posthog.capture("Request data", { Path: path });
  });
</script>
