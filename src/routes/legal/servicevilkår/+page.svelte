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
            <h1 class="mb-0">Servicevilkår</h1>
            <p class="mt-0">Sidst opdatered: 06/11/2023</p>
            <p>Velkommen til BedsteLectio. Disse servicevilkår (herefter "Vilkårene") fastlægger betingelserne for din brug af vores tjenester og platform. Ved at bruge vores tjenester accepterer du disse vilkår. Læs dem omhyggeligt.</p>
        </section>
        <section>
            <h2>Brug af tjenester</h2>
            <p>Du accepterer at bruge vores tjenester i overensstemmelse med gældende love og disse vilkår. Du er ansvarlig for at opretholde fortroligheden af dine kontooplysninger og for alt indhold, der er oprettet under din konto.</p>
        </section>
        <section>
            <h2>Oplysninger og adgang</h2>
            <p>Vi giver dig adgang til vores tjenester, herunder muligheden for at hente data fra Lectio. Du er ansvarlig for at bruge denne adgang ansvarligt og kun i overensstemmelse med vilkårene fastsat af Lectio og gældende love og regler.</p>
        </section>
        <section>
            <h2>Ansvarsfraskrivelse</h2>
            <p>Vi stræber efter at levere pålidelige tjenester, men vi kan ikke garantere, at vores tjenester altid vil være fejlfri. Vi påtager os intet ansvar for eventuelle skader, tab eller ulemper, der opstår som følge af brugen af vores tjenester.</p>
        </section>
        <section>
            <h2>Ændringer og opdateringer</h2>
            <p>Vi forbeholder os retten til at ændre, opdatere eller afbryde vores tjenester, herunder indhold og funktioner, uden forudgående varsel. Vi kan også ændre disse vilkår, og ændringer vil blive offentliggjort på vores platform. Det er dit ansvar at regelmæssigt gennemgå vilkårene for at være opdateret om eventuelle ændringer.</p>
        </section>
        <section>
            <h2>Kontakt os</h2>
            <p>
                Hvis du har spørgsmål eller bekymringer vedrørende vores tjenester eller disse vilkår, bedes du kontakte os på følgende måde:
                <br />
                Discord: @JohnnyJTH
            </p>
        </section>
        <p>Tak fordi du valgte BedsteLectio. Vi værdsætter din brug af vores tjenester.</p>
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
