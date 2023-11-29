<script>
    import { Card, CardContent, CardHeader, CardTitle } from "$components/ui/card";
</script>

<div class="grid grid-cols-1 max-md:space-y-4 lg:grid-cols-2 lg:space-x-4">
    <Card>
        <CardHeader>
            <CardTitle>Privatlivspolitik</CardTitle>
        </CardHeader>
        <CardContent>
            Forklarer hvordan vi behandler dine personlige data.
            <br />
            <a href="/legal/privatlivspolitik">Læs vores privatlivspolitik</a>
        </CardContent>
    </Card>
    <Card>
        <CardHeader>
            <CardTitle>Servicevilkår</CardTitle>
        </CardHeader>
        <CardContent>
            Beskriver dine forpligtelser overfor os som bruger.
            <br />
            <a href="/legal/servicevilkår">Læs vores servicevilkår</a>
        </CardContent>
    </Card>
</div>
