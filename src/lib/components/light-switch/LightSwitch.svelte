<script lang="ts">
  import { Moon, Sun } from "lucide-svelte";
  import { themeCurrent, setModeCurrent } from "./light-switch";
</script>

<button class="w-full" on:click={() => setModeCurrent($themeCurrent === "light" ? "dark" : "light")}>
  <div class="flex items-center justify-between">
    {#if $themeCurrent === "light"}
      Dark Mode
      <Moon />
    {:else}
      Light Mode
      <Sun />
    {/if}
  </div>
</button>
