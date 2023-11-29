<script lang="ts">
  import type { RawAbsence } from "$lib/types/absence";

  import { RequestData } from "$components";
  import { Badge } from "$components/ui/badge";
  import { Button } from "$components/ui/button";
  import { Card, CardContent, CardHeader } from "$components/ui/card";
  import { Chart } from "$components/ui/chart";
  import { Dropdown } from "$components/ui/dropdown";
  import * as Table from "$lib/components/ui/table";
  import { authStore } from "$lib/stores";
  import { constructInterval } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-svelte";
  import { DateTime, Info, Interval } from "luxon";
  import { type Writable, writable } from "svelte/store";
  import { Render, Subscribe, createTable } from "svelte-headless-table";
  import { addSortBy } from "svelte-headless-table/plugins";
  import Skeleton from "$components/ui/skeleton/Skeleton.svelte";

  let loading = true;
  let processing = true;
  let data: RawAbsence;

  let selectedAbsenceType: "calculated" | "yearly" = "calculated";

  let rawAbsence: Writable<[string, { calculated: string; yearly: string }, { calculated: string; yearly: string }][]> = writable([]);

  let absence: Writable<[string, string, string][]> = writable([]);
  $: rawAbsence.subscribe((value) => {
    absence.set(
      value.map((item) => {
        return [item[0], item[1][selectedAbsenceType], item[2][selectedAbsenceType]];
      }),
    );
  });
  let absenceReasons: Writable<
    {
      absence: string;
      class: string;
      date: Interval;
      lessonId: string;
      reason: string;
    }[]
  > = writable([]);

  let yearlyAbsence: string;
  let calculatedAbsence: string;
  let pyramidChart: ApexCharts;
  let pyramidChartOptions = {
    chart: {
      type: "bar",
    },
    dataLabels: {
      dropShadow: {
        enabled: true,
      },
      enabled: true,
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex];
      },
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        barHeight: "80%",
        borderRadius: 0,
        distributed: true,
        horizontal: true,
        isFunnel: true,
      },
    },
    series: [],
    title: {
      text: "Fraværende moduler per hold",
    },
    noData: {
      text: "Loading...",
    },
  };
  let monthlyChart: ApexCharts;
  let monthlyChartOptions = {
    chart: {
      type: "area",
    },
    dataLabels: {
      enabled: false,
    },
    series: [],
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "Månedligt fravær per hold",
    },
    noData: {
      text: "Loading...",
    },
  };

  $: if (!loading && data) {
    processing = true;
    rawAbsence.set([]);
    absenceReasons.set([]);
    data.generalt.forEach((item) => {
      if (item.hold == "Samlet") {
        yearlyAbsence = item.heleåret_fravær_procent;
        calculatedAbsence = item.opgjort_fravær_procent;
      } else {
        rawAbsence.update((old) => {
          return [
            ...old,
            [
              item.hold,
              {
                calculated: item.opgjort_fravær_procent,
                yearly: item.heleåret_fravær_procent,
              },
              {
                calculated: item.opgjort_fravær_moduler,
                yearly: item.heleåret_fravær_moduler,
              },
            ],
          ];
        });
      }
    });

    console.log(data.moduler.manglende_fraværsårsager);
    [...data.moduler.oversigt, ...data.moduler.manglende_fraværsårsager].forEach((item) => {
      // @ts-ignore
      let reason = item.årsagsnote;
      if (reason != undefined) {
        if (reason == "") {
          // @ts-ignore
          reason = item.årsag;
        } else {
          // @ts-ignore
          reason = `${reason} (${item.årsag})`;
        }
      } else {
        reason = "NOTGIVEN_" + item.aktivitet.absid;
      }
      absenceReasons.update((old) => {
        return [
          ...old,
          {
            absence: item.fravær,
            class: item.aktivitet.hold ?? "Ukendt",
            date: constructInterval(item.aktivitet.tidspunkt),
            lessonId: item.aktivitet.absid,
            reason: reason,
          },
        ];
      });
    });

    const absentLessons = [...data.moduler.oversigt, ...data.moduler.manglende_fraværsårsager];
    const rawLessonsPerClass: Record<string, number> = {};
    for (const item of absentLessons) {
      const hold = item.aktivitet.hold ?? "Ukendt";
      if (rawLessonsPerClass[hold]) {
        rawLessonsPerClass[hold] += 1;
      } else {
        rawLessonsPerClass[hold] = 1;
      }
    }
    const lessonsPerClass = Object.fromEntries(Object.entries(rawLessonsPerClass).sort(([, a], [, b]) => a - b));
    pyramidChart.updateSeries([
      {
        data: Object.values(lessonsPerClass),
        name: "",
      },
    ]);
    pyramidChart.updateOptions({
      xaxis: {
        categories: Object.keys(lessonsPerClass),
      },
    });

    const lessonsPerMonthPerClass: Record<string, Record<string, number>> = {};
    for (const item of absentLessons) {
      const lessonClass = item.aktivitet.hold ?? "Ukendt";
      const date = constructInterval(item.aktivitet.tidspunkt);
      const month = date.start?.monthLong ?? "April";

      if (!lessonsPerMonthPerClass[lessonClass]) {
        lessonsPerMonthPerClass[lessonClass] = {
          ...Object.fromEntries(Info.months("long", { locale: "da" }).map((month) => [month, 0])),
        };
      }

      lessonsPerMonthPerClass[lessonClass][month] += 1;
    }
    monthlyChart.updateSeries(
      Object.entries(lessonsPerMonthPerClass).map(([key, value]) => {
        return {
          data: Object.values(value),
          name: key,
        };
      }),
    );
    monthlyChart.updateOptions({
      xaxis: {
        categories: Info.months("long", { locale: "da" }),
      },
    });
    processing = false;
  }

  const absenceTable = createTable(absence, {
    sort: addSortBy({
      disableMultiSort: true,
      initialSortKeys: [
        {
          id: "percent",
          order: "desc",
        },
      ],
      toggleOrder: ["asc", "desc"],
    }),
  });
  const absenceColumns = absenceTable.createColumns([
    absenceTable.column({
      accessor: (row) => row[0],
      header: "Hold",
      id: "class",
    }),
    absenceTable.column({
      accessor: (row) => row[1],
      header: "Procent",
      id: "percent",
      plugins: {
        sort: {
          compareFn(left, right) {
            const [leftMatch] = left.split("%");
            const [rightMatch] = right.split("%");
            const leftValue = parseFloat(leftMatch);
            const rightValue = parseFloat(rightMatch);
            return leftValue < rightValue ? -1 : 1;
          },
        },
      },
    }),
    absenceTable.column({
      accessor: (row) => row[2],
      header: "Moduler",
      id: "lessons",
      plugins: {
        sort: {
          compareFn(left, right) {
            const [leftValue] = left.split("/");
            const [rightValue] = right.split("/");
            return leftValue < rightValue ? -1 : 1;
          },
        },
      },
    }),
  ]);
  const { headerRows: absenceHeaderRows, pageRows: absencePageRows, pluginStates: absencePluginStates, tableAttrs: absenceTableAttrs, tableBodyAttrs: absenceTableBodyAttrs } = absenceTable.createViewModel(absenceColumns);
  const { sortKeys: absenceSortKeys } = absencePluginStates.sort;

  const absenceReasonTable = createTable(absenceReasons, {
    sort: addSortBy({
      disableMultiSort: true,
      initialSortKeys: [
        {
          id: "absence",
          order: "desc",
        },
      ],
      toggleOrder: ["asc", "desc"],
    }),
  });
  const absenceReasonColumns = absenceReasonTable.createColumns([
    absenceReasonTable.column({
      accessor: "class",
      header: "Hold",
      id: "class",
    }),

    absenceReasonTable.column({
      accessor: (item) => item.date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY),
      header: "Dato",
      id: "date",
      plugins: {
        sort: {
          compareFn(left, right) {
            return left.start?.toMillis() > right.start?.toMillis() ? -1 : 1;
          },
        },
      },
    }),
    absenceReasonTable.column({
      accessor: "absence",
      header: "Fravær",
      id: "absence",
      plugins: {
        sort: {
          compareFn(left, right) {
            const [leftMatch] = left.split("%");
            const [rightMatch] = right.split("%");
            const leftValue = parseFloat(leftMatch);
            const rightValue = parseFloat(rightMatch);
            return leftValue < rightValue ? -1 : 1;
          },
        },
      },
    }),
    absenceReasonTable.column({
      accessor: "reason",
      header: "Årsag",
      id: "reason",
    }),
  ]);
  const { headerRows: absenceReasonHeaderRows, pageRows: absenceReasonPageRows, pluginStates: absenceReasonPluginStates, tableAttrs: absenceReasonTableAttrs, tableBodyAttrs: absenceReasonTableBodyAttrs } = absenceReasonTable.createViewModel(absenceReasonColumns);
  const { sortKeys: absenceReasonSortKeys } = absenceReasonPluginStates.sort;
</script>

<RequestData bind:data bind:loading path="fravaer" />

<div class="page-container">
  <div class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between">
    <h1 class="!mb-0">Fravær</h1>
    {#if processing}
      <Skeleton class="h-12 w-48 rounded-md" />
    {:else}
      <Dropdown bind:value={selectedAbsenceType} options={{ "For året": "yearly", Opgjort: "calculated" }} placeholder="Opgjort" />
    {/if}
  </div>
  <div class="flex gap-4">
    <Card class="w-full">
      <CardHeader class="pb-0">Opgjort</CardHeader>
      <CardContent class="text-4xl font-bold">
        {#if processing}
          <Skeleton class="h-10 w-24 rounded-md" />
        {:else}
          {calculatedAbsence}
        {/if}
      </CardContent>
    </Card>
    <Card class="w-full">
      <CardHeader class="pb-0">For året</CardHeader>
      <CardContent class="text-4xl font-bold">
        {#if processing}
          <Skeleton class="h-10 w-24 rounded-md" />
        {:else}
          {yearlyAbsence}
        {/if}
      </CardContent>
    </Card>
  </div>
  <div class="flex flex-col md:flex-row justify-evenly gap-4 p-4 bg-white dark:bg-dark rounded-md">
    <Chart bind:chart={pyramidChart} bind:options={pyramidChartOptions} />
    <Chart bind:chart={monthlyChart} bind:options={monthlyChartOptions} />
  </div>
  <div class="p-4 bg-white dark:bg-dark rounded-md">
    <div class="mb-[1em] flex">
      <h2 class="m-0">Fraværsårsager</h2>
      {#if !processing && data.moduler.manglende_fraværsårsager.length}
        <Badge class="ml-2" variant="destructive">Manglende fraværsårsager: {data.moduler.manglende_fraværsårsager.length}</Badge>
      {/if}
    </div>
    {#if processing}
      <div class="h-14 p-4 w-full border-y">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
      <div class="h-10 p-2 w-full border-b">
        <Skeleton class="h-5 w-full rounded-md" />
      </div>
    {:else}
      <Table.Root {...$absenceReasonTableAttrs}>
        <Table.Header>
          {#each $absenceReasonHeaderRows as headerRow}
            <Subscribe rowAttrs={headerRow.attrs()}>
              <Table.Row>
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs let:props props={cell.props()}>
                    <Table.Head {...attrs}>
                      {#if !props.sort.disabled}
                        <Button on:click={props.sort.toggle} variant="ghost">
                          <Render of={cell.render()} />
                          {#if $absenceReasonSortKeys[0]?.id == cell.id}
                            {#if $absenceReasonSortKeys[0].order === "asc"}
                              <ArrowUp class="text-foreground ml-2 h-4 w-4" />
                            {:else}
                              <ArrowDown class="text-foreground ml-2 h-4 w-4" />
                            {/if}
                          {:else}
                            <ArrowUpDown class={"opacity-0 ml-2 h-4 w-4"} />
                          {/if}
                        </Button>
                      {:else}
                        <Render of={cell.render()} />
                      {/if}
                    </Table.Head>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Header>
        <Table.Body {...$absenceReasonTableBodyAttrs}>
          {#each $absenceReasonPageRows as row (row.id)}
            <Subscribe let:rowAttrs rowAttrs={row.attrs()}>
              <Table.Row {...rowAttrs}>
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell {...attrs}>
                      {#if cell.id === "reason"}
                        {#if cell.value.startsWith("NOTGIVEN_")}
                          <Badge href={`https://www.lectio.dk/lectio/${$authStore.school}/fravaer_aarsag.aspx?elevid=${decodeUserID($authStore.cookie)}&id=${cell.value.split("_")[1]}&atype=aa`} target="_blank" variant="destructive">Angiv fraværsårsag</Badge>
                        {:else}
                          <Render of={cell.render()} />
                        {/if}
                      {:else}
                        <Render of={cell.render()} />
                      {/if}
                    </Table.Cell>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </div>
  {#if !processing}
    <div class="p-4 bg-white dark:bg-dark rounded-md">
      <h2 class="mt-0">Overblik</h2>
      <Table.Root {...$absenceTableAttrs}>
        <Table.Header>
          {#each $absenceHeaderRows as headerRow}
            <Subscribe rowAttrs={headerRow.attrs()}>
              <Table.Row>
                {#each headerRow.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs let:props props={cell.props()}>
                    <Table.Head {...attrs}>
                      {#if !props.sort.disabled}
                        <Button on:click={props.sort.toggle} variant="ghost">
                          <Render of={cell.render()} />
                          {#if $absenceSortKeys[0]?.id == cell.id}
                            {#if $absenceSortKeys[0].order === "asc"}
                              <ArrowUp class="text-foreground ml-2 h-4 w-4" />
                            {:else}
                              <ArrowDown class="text-foreground ml-2 h-4 w-4" />
                            {/if}
                          {:else}
                            <ArrowUpDown class={"opacity-0 ml-2 h-4 w-4"} />
                          {/if}
                        </Button>
                      {:else}
                        <Render of={cell.render()} />
                      {/if}
                    </Table.Head>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Header>
        <Table.Body {...$absenceTableBodyAttrs}>
          {#each $absencePageRows as row (row.id)}
            <Subscribe let:rowAttrs rowAttrs={row.attrs()}>
              <Table.Row {...rowAttrs}>
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell {...attrs}>
                      <Render of={cell.render()} />
                    </Table.Cell>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
</div>
