<script lang="ts">
    import { createTableOfContents } from "@melt-ui/svelte";
    import Tree from "../Tree.svelte";

    const {
        elements: { item },
        states: { headingsTree, activeHeadingIdxs },
    } = createTableOfContents({
        selector: "#legal-content",
        exclude: ["h1"],
    });
</script>

<div class="flex items-start gap-10">
    <div id="legal-content">
        <section>
            <h1 class="mb-0">Privatlivspolitik</h1>
            <p class="mt-0">Sidst opdatered: 06/11/2023</p>
            <p>Velkommen til Bedstelectio. Denne privatlivspolitik beskriver, hvordan vi indsamler, bruger og beskytter dine personlige oplysninger, når du besøger vores hjemmeside eller bruger vores tjenester.</p>
        </section>
        <section>
            <h2>Oplysninger, vi indsamler</h2>
            <p>Vi kan indsamle følgende typer af personlige oplysninger:</p>
            <ul>
                <li>Lectio konto oplysninger.</li>
                <li>Preferencer, som selvvalgte holdfarver, tilknyttet til lectio user id.</li>
                <li>Eventuelle frivilligt indsendte oplysninger, når du kontakter vores kundeservice eller deltager i undersøgelser og konkurrencer.</li>
            </ul>
        </section>
        <section>
            <h2>Formål med behandling af oplysninger</h2>
            <p>Vi indsamler og behandler dine personlige oplysninger til følgende formål:</p>
            <ul>
                <li>Funktionsnødvendige funktioner, som at hente data fra lectio.</li>
                <li>At forbedre vores platform og tilpasse den til dine præferencer.</li>
                <li>At overholde gældende love og reguleringer.</li>
            </ul>
        </section>
        <section>
            <h2>Deling af oplysninger</h2>
            <p>Vi kan dele dine personlige oplysninger med tredjeparter, herunder:</p>
            <ul>
                <li>Lectio, som skal vide hvis' info der skal ses.</li>
                <li>Juridiske myndigheder og myndigheder for at overholde love og reguleringer.</li>
            </ul>
        </section>
        <section>
            <h2>Beskyttelse af oplysninger</h2>
            <p>Vi tager passende sikkerhedsforanstaltninger for at beskytte dine personlige oplysninger mod uautoriseret adgang, ændring eller offentliggørelse. Vi opbevarer dine oplysninger sikkert og anvender tekniske og organisatoriske sikkerhedsforanstaltninger for at beskytte dine data.</p>
        </section>
        <section>
            <h2>Dine rettigheder</h2>
            <p>Du har visse rettigheder vedrørende dine personlige oplysninger, herunder retten til at anmode om adgang, rettelse, sletning, begrænsning af behandling og dataportabilitet. Du kan også til enhver tid trække dit samtykke tilbage til markedsføringsformål.</p>
        </section>
        <section>
            <h2>Kontakt os</h2>
            <p>
                Hvis du har spørgsmål eller bekymringer vedrørende denne privatlivspolitik eller behandlingen af dine personlige oplysninger, bedes du kontakte os på følgende måde:
                <br />
                Discord: @JohnnyJTH
            </p>
        </section>
        <p>
            Vi forbeholder os retten til at ændre denne privatlivspolitik, og opdaterede versioner vil blive offentliggjort på vores hjemmeside. Vi anbefaler, at du regelmæssigt gennemgår denne politik for at være opdateret om vores praksis vedrørende beskyttelse af personlige oplysninger.
            <br />
            Tak fordi du valgte BedsteLectio.
        </p>
    </div>
    <aside class="hidden xl:block w-80" />
    <aside class="fixed hidden xl:block top-30 right-0 w-80 p-4 bg-white dark:bg-dark rounded-md">
        <nav>
            <h2 class="mt-0 mb-0">Indhold</h2>
            {#key $headingsTree}
                <Tree tree={$headingsTree} activeHeadingIdxs={$activeHeadingIdxs} {item} />
            {/key}
        </nav>
    </aside>
</div>
