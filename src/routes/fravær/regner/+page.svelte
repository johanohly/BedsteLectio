<script lang="ts">
    import { RequestData } from "$components";
    import { Button } from "$components/ui/button";
    import type { RawAbsence } from "$lib/types/absence";
    import { ArrowLeft } from "lucide-svelte";

    let loading = true;
    let data: RawAbsence;
    let step: "period" | "type" | "amount" | "result" = "period";
    let period: "elapsed" | "year";
    let type: "percent" | "modules";
</script>

<RequestData bind:data bind:loading path="fravaer" />

<div class="page-container">
    <div class="space-y-1">
        <Button href="/fravær" size="sm"><ArrowLeft class="w-6 h-6" /> Tilbage til fravær</Button>
        <h1>Fraværsregner</h1>
    </div>
    {#if loading}
        <p>Loading...</p>
    {:else if step === "period"}
        <h3 class="m-0">Vil du regne opgjort eller årligt fravær ud?</h3>
        <div class="!m-0 flex flex-col md:flex-row gap-2">
            <Button on:click={() => {period = "elapsed"; step = "type"}} class="flex-1" size="xl">Opgjort</Button>
            <Button on:click={() => {period = "year"; step = "type"}} class="flex-1" size="xl">For året</Button>
        </div>
    {:else if step === "type"}
        <h3 class="m-0">Vil du angive dit ønskede fravær i procent eller moduler?</h3>
        <div class="!m-0 flex flex-col md:flex-row gap-2">
            <Button on:click={() => {type = "percent"; step = "amount"}} class="flex-1" size="xl">Procent</Button>
            <Button on:click={() => {type = "modules"; step = "amount"}} class="flex-1" size="xl">Moduler</Button>
        </div>
    {:else if step === "amount"}
        <h3 class="m-0">Hvor meget fravær vil du ende med?</h3>
        <div class="!m-0 flex flex-col md:flex-row gap-2">
            WIP
        </div>
    {/if}
</div>
