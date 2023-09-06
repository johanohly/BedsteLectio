<script lang="ts">
  import { RequestData } from "$components";
  import { modeCurrent } from "$components/light-switch/light-switch";
  import { Badge } from "$components/ui/badge";
  import { Button } from "$components/ui/button";
  import { Card, CardContent, CardHeader } from "$components/ui/card";
  import { Chart } from "$components/ui/chart";
  import { Select } from "$components/ui/select";
  import * as Table from "$lib/components/ui/table";
  import { authStore } from "$lib/stores";
  import type { RawAbsence } from "$lib/types/absence";
  import { constructInterval } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-svelte";
  import { DateTime, Info, Interval } from "luxon";
  import { createTable, Subscribe, Render } from "svelte-headless-table";
  import { addSortBy } from "svelte-headless-table/plugins";
  import { get, writable, type Writable } from "svelte/store";

  let loading = true;
  let data: RawAbsence;

  let selectedAbsenceType: "calculated" | "yearly" = "calculated";

  let rawAbsence: Writable<
    [
      string,
      { calculated: string; yearly: string },
      { calculated: string; yearly: string }
    ][]
  > = writable([]);

  let absence: Writable<[string, string, string][]> = writable([]);
  $: rawAbsence.subscribe((value) => {
    absence.set(
      value.map((item) => {
        return [
          item[0],
          item[1][selectedAbsenceType],
          item[2][selectedAbsenceType],
        ];
      })
    );
  });
  let absenceReasons: Writable<
    {
      lessonId: string;
      class: string;
      absence: string;
      date: Interval;
      category: string;
      reason: string;
    }[]
  > = writable([]);

  let yearlyAbsence: string;
  let calculatedAbsence: string;
  let pyramidChart: object | null = null;
  let monthlyChart: object | null = null;
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

    [
      ...data.moduler.oversigt,
      ...data.moduler.manglende_fraværsårsager,
    ].forEach((item) => {
      let reason = item.årsagsnote;
      if (reason != undefined) {
        if (reason == "") {
          reason = item.årsag;
        } else {
          reason = `${reason} (${item.årsag})`
        }
      } else {
        reason = "NOTGIVEN_" + item.aktivitet.absid
      }
      absenceReasons.update((old) => {
        return [
          ...old,
          {
            lessonId: item.aktivitet.absid,
            class: item.aktivitet.hold ?? "Ukendt",
            absence: item.fravær,
            date: constructInterval(item.aktivitet.tidspunkt),
            reason: reason,
          },
        ];
      });
    });

    const absentLessons = [
      ...data.moduler.oversigt,
      ...data.moduler.manglende_fraværsårsager,
    ];
    const lessonsPerClass = absentLessons.reduce((acc, item) => {
      if (acc[item.aktivitet.hold]) {
        acc[item.aktivitet.hold] += 1;
      } else {
        acc[item.aktivitet.hold] = 1;
      }
      return acc;
    }, {});
    pyramidChart = {
      theme: {
        mode: "light",
      },
      chart: {
        type: "bar",
      },
      legend: {
        show: false,
      },
      title: {
        text: "Fraværende moduler per hold",
      },
      series: [
        {
          name: "",
          data: Object.values(lessonsPerClass),
        },
      ],
      xaxis: {
        categories: Object.keys(lessonsPerClass),
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          distributed: true,
          barHeight: "80%",
          isFunnel: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex];
        },
        dropShadow: {
          enabled: true,
        },
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
      theme: {
        mode: "light",
      },
      chart: {
        type: "area",
      },
      title: {
        text: "Månedligt fravær per hold",
      },
      series: Object.entries(lessonsPerMonthPerClass).map(([key, value]) => {
        return {
          name: key,
          data: Object.values(value),
        };
      }),
      xaxis: {
        categories: Info.months("long", { locale: "da" }),
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
    };
  }

  const absenceTable = createTable(absence, {
    sort: addSortBy({
      initialSortKeys: [
        {
          id: "percent",
          order: "desc",
        },
      ],
      toggleOrder: ["asc", "desc"],
      disableMultiSort: true,
    }),
  });
  const absenceColumns = absenceTable.createColumns([
    absenceTable.column({
      id: "class",
      header: "Hold",
      accessor: (row) => row[0],
    }),
    absenceTable.column({
      id: "percent",
      header: "Procent",
      accessor: (row) => row[1],
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
      id: "lessons",
      header: "Moduler",
      accessor: (row) => row[2],
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
  const {
    headerRows: absenceHeaderRows,
    pageRows: absencePageRows,
    tableAttrs: absenceTableAttrs,
    tableBodyAttrs: absenceTableBodyAttrs,
    pluginStates: absencePluginStates,
  } = absenceTable.createViewModel(absenceColumns);
  const { sortKeys: absenceSortKeys } = absencePluginStates.sort;

  const absenceReasonTable = createTable(absenceReasons, {
    sort: addSortBy({
      initialSortKeys: [
        {
          id: "absence",
          order: "desc",
        },
      ],
      toggleOrder: ["asc", "desc"],
      disableMultiSort: true,
    }),
  });
  const absenceReasonColumns = absenceReasonTable.createColumns([
    absenceReasonTable.column({
      id: "class",
      header: "Hold",
      accessor: "class",
    }),

    absenceReasonTable.column({
      id: "date",
      header: "Dato",
      accessor: (item) =>
        item.date.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY),
      plugins: {
        sort: {
          compareFn(left, right) {
            return left.start?.toMillis() > right.start?.toMillis() ? -1 : 1;
          },
        },
      },
    }),
    absenceReasonTable.column({
      id: "absence",
      header: "Fravær",
      accessor: "absence",
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
      id: "reason",
      header: "Årsag",
      accessor: "reason",
    }),
  ]);
  const {
    headerRows: absenceReasonHeaderRows,
    pageRows: absenceReasonPageRows,
    tableAttrs: absenceReasonTableAttrs,
    tableBodyAttrs: absenceReasonTableBodyAttrs,
    pluginStates: absenceReasonPluginStates,
  } = absenceReasonTable.createViewModel(absenceReasonColumns);
  const { sortKeys: absenceReasonSortKeys } = absenceReasonPluginStates.sort;
</script>

<RequestData bind:loading bind:data path="fravaer" />

{#if loading}
  loading
{:else}
  <div class="page-container">
    <div
      class="flex flex-col-reverse md:flex-row items-start md:items-center justify-between"
    >
      <h1 class="!mb-0">Fravær</h1>
      <Select
        options={{ Opgjort: "calculated", "For året": "yearly" }}
        bind:value={selectedAbsenceType}
        placeholder="Opgjort"
      />
    </div>
    <div class="flex gap-4">
      <Card class="w-full">
        <CardHeader class="pb-0">Opgjort</CardHeader>
        <CardContent class="text-4xl font-bold">{calculatedAbsence}</CardContent
        >
      </Card>
      <Card class="w-full">
        <CardHeader class="pb-0">For året</CardHeader>
        <CardContent class="text-4xl font-bold">{yearlyAbsence}</CardContent>
      </Card>
    </div>
    <div
      class="flex flex-col md:flex-row justify-evenly gap-4 p-4 bg-white dark:bg-dark rounded-md"
    >
      {#key $modeCurrent}
        <Chart bind:options={pyramidChart} />
        <Chart bind:options={monthlyChart} />
      {/key}
    </div>
    <div class="p-4 bg-white dark:bg-dark rounded-md">
      {#if data.moduler.manglende_fraværsårsager.length}
        <div class="mb-[1em] flex">
          <h2 class="m-0">Fraværsårsager</h2>
          <Badge class="ml-2" variant="destructive"
            >Manglende fraværsårsager: {data.moduler.manglende_fraværsårsager
              .length}</Badge
          >
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
                  <Subscribe
                    attrs={cell.attrs()}
                    let:attrs
                    props={cell.props()}
                    let:props
                  >
                    <Table.Head {...attrs}>
                      {#if !props.sort.disabled}
                        <Button variant="ghost" on:click={props.sort.toggle}>
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
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <Table.Row {...rowAttrs}>
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell {...attrs}>
                      {#if cell.id === "reason"}
                        {#if cell.value.startsWith("NOTGIVEN_")}
                          <Badge
                            variant="destructive"
                            href={`https://www.lectio.dk/lectio/${
                              $authStore.school
                            }/fravaer_aarsag.aspx?elevid=${decodeUserID(
                              $authStore.cookie
                            )}&id=${cell.value.split("_")[1]}&atype=aa`}
                            target="_blank">Angiv fraværsårsag</Badge
                          >
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
                  <Subscribe
                    attrs={cell.attrs()}
                    let:attrs
                    props={cell.props()}
                    let:props
                  >
                    <Table.Head {...attrs}>
                      {#if !props.sort.disabled}
                        <Button variant="ghost" on:click={props.sort.toggle}>
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
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
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
