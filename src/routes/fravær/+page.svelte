<script lang="ts">
  import type { RawAbsence } from "$lib/types/absence";

  import { RequestData } from "$components";
  import { modeCurrent } from "$components/light-switch/light-switch";
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

  let loading = true;
  let data: RawAbsence;

  let selectedAbsenceType: "calculated" | "yearly" = "calculated";

  let rawAbsence: Writable<[string, { calculated: string; yearly: string }, { calculated: string; yearly: string }][]> = writable([]);

  let absence: Writable<[string, string, string][]> = writable([]);
  $: rawAbsence.subscribe((value) => {
    absence.set(
      value.map((item) => {
        return [item[0], item[1][selectedAbsenceType], item[2][selectedAbsenceType]];
      })
    );
  });
  let absenceReasons: Writable<
    {
      absence: string;
      category: string;
      class: string;
      date: Interval;
      lessonId: string;
      reason: string;
    }[]
  > = writable([]);

  let yearlyAbsence: string;
  let calculatedAbsence: string;
  let pyramidChart: null | object = null;
  let monthlyChart: null | object = null;
  $: if (!loading && data) {
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

    [...data.moduler.oversigt, ...data.moduler.manglende_fraværsårsager].forEach((item) => {
      let reason = item.årsagsnote;
      if (reason != undefined) {
        if (reason == "") {
          reason = item.årsag;
        } else {
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
    const rawLessonsPerClass = absentLessons.reduce((acc, item) => {
      if (acc[item.aktivitet.hold]) {
        acc[item.aktivitet.hold] += 1;
      } else {
        acc[item.aktivitet.hold] = 1;
      }
      return acc;
    }, {});
    const lessonsPerClass = Object.fromEntries(Object.entries(rawLessonsPerClass).sort(([, a], [, b]) => a - b));
    pyramidChart = {
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
      series: [
        {
          data: Object.values(lessonsPerClass),
          name: "",
        },
      ],
      theme: {
        mode: "light",
      },
      title: {
        text: "Fraværende moduler per hold",
      },
      xaxis: {
        categories: Object.keys(lessonsPerClass),
      },
    };
    const lessonsPerMonthPerClass = absentLessons.reduce((acc, item) => {
      const lessonClass = item.aktivitet.hold ?? "Ukendt";
      const date = constructInterval(item.aktivitet.tidspunkt);
      const month = date.start?.monthLong ?? "april";
      if (acc[lessonClass]) {
        acc[lessonClass][month] += 1;
      } else {
        acc[lessonClass] = {
          ...Object.assign(
            {},
            ...Info.months("long", { locale: "da" }).map((month) => ({
              [month]: 0,
            }))
          ),
        };
        acc[lessonClass][month] = 1;
      }
      return acc;
    }, {});
    monthlyChart = {
      chart: {
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      series: Object.entries(lessonsPerMonthPerClass).map(([key, value]) => {
        return {
          data: Object.values(value),
          name: key,
        };
      }),
      stroke: {
        curve: "smooth",
      },
      theme: {
        mode: "light",
      },
      title: {
        text: "Månedligt fravær per hold",
      },
      xaxis: {
        categories: Info.months("long", { locale: "da" }),
      },
    };
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

{#if loading}
  loading
{:else}
  <div class="page-container">
    <div class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between">
      <h1 class="!mb-0">Fravær</h1>
      <Dropdown bind:value={selectedAbsenceType} options={{ "For året": "yearly", Opgjort: "calculated" }} placeholder="Opgjort" />
    </div>
    <div class="flex gap-4">
      <Card class="w-full">
        <CardHeader class="pb-0">Opgjort</CardHeader>
        <CardContent class="text-4xl font-bold">{calculatedAbsence}</CardContent>
      </Card>
      <Card class="w-full">
        <CardHeader class="pb-0">For året</CardHeader>
        <CardContent class="text-4xl font-bold">{yearlyAbsence}</CardContent>
      </Card>
    </div>
    <div class="flex flex-col md:flex-row justify-evenly gap-4 p-4 bg-white dark:bg-dark rounded-md">
      {#key $modeCurrent}
        <Chart bind:options={pyramidChart} />
        <Chart bind:options={monthlyChart} />
      {/key}
    </div>
    <div class="p-4 bg-white dark:bg-dark rounded-md">
      {#if data.moduler.manglende_fraværsårsager.length}
        <div class="mb-[1em] flex">
          <h2 class="m-0">Fraværsårsager</h2>
          <Badge class="ml-2" variant="destructive">Manglende fraværsårsager: {data.moduler.manglende_fraværsårsager.length}</Badge>
        </div>
      {:else}
        <h2 class="mt-0">Årsager</h2>
      {/if}
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
    </div>
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
  </div>
{/if}
