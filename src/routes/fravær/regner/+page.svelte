<script lang="ts">
    import { RequestData } from "$components";
    import { Button } from "$components/ui/button";
    import { Skeleton } from "$components/ui/skeleton";
    import { Slider } from "$components/ui/slider";
    import type { RawAbsence } from "$lib/types/absence";
    import { ArrowLeft } from "lucide-svelte";

    let loading = true;
    let data: RawAbsence;
    let classes = {
        elapsed: {
            actual: 0,
            total: 0,
        },
        year: {
            actual: 0,
            total: 0,
        },
    };
    $: if (!loading && data) {
        data.generalt.forEach((item) => {
            if (item.hold == "Samlet") {
                const elapsed = /(?<_>\d+,?\d*|,\d+)\/(?<__>\d+,?\d*|,\d+)/gu.exec(item.opgjort_fravær_moduler);
                const year = /(?<_>\d+,?\d*|,\d+)\/(?<__>\d+,?\d*|,\d+)/gu.exec(item.heleåret_fravær_moduler);
                if (elapsed && year) {
                    classes = {
                        elapsed: {
                            actual: +elapsed[1],
                            total: +elapsed[2],
                        },
                        year: {
                            actual: +year[1],
                            total: +year[2],
                        },
                    };
                }
            }
        });
    }

    let step: "period" | "type" | "amount" | "result" = "period";
    let period: "elapsed" | "year";
    let type: "percent" | "modules";
    let amount = 10;
    $: textAmount = amount.toString();

    let result = 0;
    const calculate = () => {
        if (type === "percent") {
            result = Math.floor(classes[period].total * (amount / 100));
        } else {
            result = classes[period].actual - amount;
        }
        step = "result";
    };
</script>

<RequestData bind:data bind:loading path="fravaer" />

<div class="page-container">
    <div class="space-y-1">
        <Button href="/fravær" size="sm"><ArrowLeft class="w-6 h-6" /> Tilbage til fravær</Button>
        <h1>Fraværsregner</h1>
    </div>
    {#if loading}
        <Skeleton class="!mt-4 !mb-1 h-[1.5rem] w-3/4 rounded-md" />
        <div class="!m-0 flex flex-col md:flex-row gap-2">
            <Skeleton class="h-20 flex-1 rounded-md" />
            <Skeleton class="h-20 flex-1 rounded-md" />
        </div>
    {:else if step === "period"}
        <h3 class="!mt-4">Vil du regne opgjort eller årligt fravær ud?</h3>
        <div class="!m-0 flex flex-col md:flex-row gap-2">
            <Button
                on:click={() => {
                    period = "elapsed";
                    step = "type";
                }}
                class="flex-1"
                size="xl">Opgjort</Button
            >
            <Button
                on:click={() => {
                    period = "year";
                    step = "type";
                }}
                class="flex-1"
                size="xl">For året</Button
            >
        </div>
    {:else if step === "type"}
        <h3 class="!mt-4">Vil du angive dit ønskede fravær i procent eller moduler?</h3>
        <div class="!m-0 flex flex-col md:flex-row gap-2">
            <Button
                on:click={() => {
                    type = "percent";
                    step = "amount";
                }}
                class="flex-1"
                size="xl">Procent</Button
            >
            <Button
                on:click={() => {
                    type = "modules";
                    step = "amount";
                }}
                class="flex-1"
                size="xl">Moduler</Button
            >
        </div>
    {:else if step === "amount"}
        <h3 class="!mt-4">Hvor meget fravær vil du ende med?</h3>
        <div class="!m-0 flex">
            <span class="font-mono text-[5rem] leading-[5rem] md:text-[10rem] md:leading-[10rem]">{textAmount}</span>
            <span class="self-end font-mono text-[2.5rem] leading-[2.5rem] md:text-[5rem] md:leading-[5rem]">{type === "percent" ? "%" : "moduler"}</span>
        </div>
        <Slider bind:value={amount} />
        <Button on:click={calculate}>Beregn</Button>
    {:else if step === "result"}
        <h3 class="!mt-4">Du kan have {result} moduler fravær for at ende med {amount}{type === "percent" ? "%" : " moduler"} fravær.</h3>
    {/if}
</div>
