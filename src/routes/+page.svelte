<script lang="ts">
  import { onMount } from "svelte";

  onMount(async () => {
    const response = await fetch("/api/log-ind", {
      headers: {
        username: "jooh2",
        password: "NKMyWSeJ",
        school: "681",
      },
    });
    const data = await response.text();
    console.log(data);
  });
</script>

<h1>Hello World!</h1>
