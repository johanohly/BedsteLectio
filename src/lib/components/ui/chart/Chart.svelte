<script lang="ts">
  import { themeCurrent } from "$components/light-switch";
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
      colors: $themeCurrent === "light" ? ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"] : ["#25fcb0", "#208bf3", "#6f5beb", "#3445de"],
      theme: {
        mode: $themeCurrent === "light" ? "light" : "dark",
      },
    });
  }
</script>

<div bind:this={chartEl} class="w-full" />
