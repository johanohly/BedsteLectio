<script lang="ts">
  import { modeCurrent } from "$components/light-switch/light-switch";
  import ApexCharts from "apexcharts";

  let chartEl: HTMLElement;
  export let options: object | null;

  $: if (chartEl && options != null) {
    const chart = new ApexCharts(chartEl, options);
    chart.render();
  }
  $: if (options != null) {
    $modeCurrent
      ? (options.theme.mode = "light")
      : (options.theme.mode = "dark");
  }
</script>

<div bind:this={chartEl} class="w-full" />
