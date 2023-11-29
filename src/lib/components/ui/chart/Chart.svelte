<script lang="ts">
  import { modeCurrent } from "$components/light-switch/light-switch";
  import ApexCharts from "apexcharts";
  import { onMount } from "svelte";

  export let chart: ApexCharts;
  let chartEl: HTMLElement;
  export let options: null | object;

  onMount(() => {
    chart = new ApexCharts(chartEl, options);
    chart.render();

    return () => {
      chart.destroy();
    };
  });
  $: if (chart) {
    chart.updateOptions({
      theme: {
        mode: $modeCurrent ? "light" : "dark",
      },
    });
  }
</script>

<div bind:this={chartEl} class="w-full" />
