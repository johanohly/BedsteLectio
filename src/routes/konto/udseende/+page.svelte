<script lang="ts">
    import { RequestData } from "$components";
    import { addToast } from "$components/toaster";
    import { Select } from "$components/ui/assignableselect";
    import { Button } from "$components/ui/button";
    import { ColorPicker, isColorValid } from "$components/ui/colorpicker";
    import { authStore } from "$lib/stores";
    import type { Settings } from "$lib/types/settings";
    import { ArrowDownToLine, Loader2, X } from "lucide-svelte";

    let loading = true;
    let data: { hold_og_grupper: { [key: string]: string } };
    let classes: { [key: string]: string };
    $: if (!loading && data) {
        classes = data.hold_og_grupper;
    }

    let settings: Settings;
    let customColors: { class: string; color: string }[] = [];
    let classNames: { class: { name: string; id: string }; name: string; loading: boolean }[] = [];
    $: if (!loading && !customColors.length) {
        customColors = settings.customColors ? Object.entries(settings.customColors).map(([key, value]) => ({ class: key, color: value })) : [];
        classNames = settings.customColors ? Object.entries(settings.classNames).map(([key, value]) => ({ class: { name: key, id: "" }, name: value, loading: false })) : [];
    }

    $: validColors = customColors.every((entry) => entry.class != "" && isColorValid(entry.color));
    let submittingColors = false;
    const submitColors = async () => {
        submittingColors = true;
        const response = await fetch("/api/settings/colors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "lectio-cookie": $authStore.cookie,
            },
            body: JSON.stringify({
                custom_colors: Object.fromEntries(customColors.map((entry) => [entry.class, entry.color])),
            }),
        });
        submittingColors = false;
        if (!response.ok) {
            if (settings) customColors = settings.customColors ? Object.entries(settings.customColors).map(([key, value]) => ({ class: key, color: value })) : [];
            addToast({
                data: {
                    title: "Fejl",
                    description: "Der skete en fejl. Farverne kunne ikke gemmes.",
                    color: "bg-red-500",
                },
            });
        } else {
            addToast({
                data: {
                    title: "Succes",
                    description: "Farverne blev gemt.",
                    color: "bg-green-500",
                },
            });
        }
    };

    let loadingUserClasses = false;
    const fetchClasses = async () => {
        loadingUserClasses = true;
        const response = await fetch("https://api.bedstelectio.dk/forside", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "lectio-cookie": $authStore.cookie,
            },
        });
        loadingUserClasses = false;
        if (!response.ok) {
            return addToast({
                data: {
                    title: "Fejl",
                    description: "Der skete en fejl. Holdnavne kunne ikke hentes.",
                    color: "bg-red-500",
                },
            });
        }

        const json = (await response.json()) as { hold_og_grupper: { hold: { [key: string]: string } } };
        if (!Object.keys(json.hold_og_grupper.hold).length) {
            return addToast({
                data: {
                    title: "Fejl",
                    description: "Der kunne ikke findes nogle hold navne.",
                    color: "bg-red-500",
                },
            });
        }

        classNames = Object.entries(json.hold_og_grupper.hold).map(([key, value]) => ({ class: { name: key, id: value }, name: "", loading: true }));
        classNames.forEach(async (entry) => await fetchName(entry.class, false)());
        classNames = classNames;
    };

    const fetchName =
        (entry: { name: string; id: string }, setLoad = true) =>
        async () => {
            const index = classNames.findIndex((e) => e.class.name == entry.name);
            if (setLoad) {
                classNames[index].loading = true;
                classNames = classNames;
            }

            let id: string;
            if (entry.id != "") {
                id = entry.id;
            } else {
                const matches = Object.entries(classes).filter((e) => e[0] == entry.name);
                if (matches.length) id = matches[0][1];
                else {
                    addToast({
                        data: {
                            title: "Fejl",
                            description: "Der skete en fejl. Holdets id kunne ikke findes.",
                            color: "bg-red-500",
                        },
                    });
                    classNames[index].loading = false;
                    classNames = classNames;
                    return;
                }
            }
            const response = await fetch(`https://api.bedstelectio.dk/hold_til_fag?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "lectio-cookie": $authStore.cookie,
                },
            });
            if (response.ok) {
                const json = (await response.json()) as { fag: string };
                classNames[index].name = json.fag;
            } else {
                addToast({
                    data: {
                        title: "Fejl",
                        description: "Der skete en fejl. Holdnavn kunne ikke hentes.",
                        color: "bg-red-500",
                    },
                });
            }
            classNames[index].loading = false;
            classNames = classNames;
        };

    $: validNames = classNames.every((entry) => entry.class.name != "" && entry.name != "");
    let submittingNames = false;
    const submitNames = async () => {
        submittingNames = true;
        const response = await fetch("/api/settings/names", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "lectio-cookie": $authStore.cookie,
            },
            body: JSON.stringify({
                class_names: Object.fromEntries(classNames.map((entry) => [entry.class.name, entry.name])),
            }),
        });
        submittingNames = false;
        if (!response.ok) {
            if (settings) classNames = settings.classNames ? Object.entries(settings.classNames).map(([key, value]) => ({ class: { name: key, id: "" }, name: value, loading: false })) : [];
            addToast({
                data: {
                    title: "Fejl",
                    description: "Der skete en fejl. Navnene kunne ikke gemmes.",
                    color: "bg-red-500",
                },
            });
        } else {
            addToast({
                data: {
                    title: "Succes",
                    description: "Navnene blev gemt.",
                    color: "bg-green-500",
                },
            });
        }
    };
</script>

<RequestData bind:loading bind:data bind:settings path="informationer" withSettings />

<section>
    <h2 class="mt-0">Udseende</h2>
    <p>Her kan du se og redigere BedsteLectio's udseende.</p>
    <div class="space-y-4">
        <div class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400">
            <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
                <h4 class="mt-0">Hold Farver</h4>
                <p class="text-sm">Her kan du manuelt ændre farverne af holdene på skemaet, for eksempel.</p>
                {#if loading || !classes}
                    <Loader2 class="animate-spin w-6 h-6 text-gray-500" />
                {:else if settings == undefined}
                    <p class="text-gray-500">Der skete en fejl. Indstillinger kan ikke ændres for tiden.</p>
                {:else}
                    <div class="space-y-2">
                        {#each customColors as color}
                            <div class="flex space-x-2">
                                <div class="w-full flex space-x-2">
                                    <Select bind:value={color.class} items={Object.keys(classes)} placeholder="Vælg hold..." />
                                    <ColorPicker bind:color={color.color} />
                                </div>
                                <Button
                                    on:click={() => {
                                        customColors = customColors.filter((entry) => entry != color);
                                    }}
                                    size="icon"><X /></Button
                                >
                            </div>
                        {/each}
                        <Button
                            on:click={() => {
                                customColors.push({ class: "", color: "" });
                                customColors = customColors;
                            }}
                            size="sm">Tilføj</Button
                        >
                    </div>
                {/if}
            </div>
            <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
                <p class="my-0 text-gray-500">Farver bliver representeret som lysstyrke i HSL farvesystemet.</p>
                <div class="flex items-center justify-end ml-auto">
                    <Button on:click={submitColors} disabled={loading || settings == undefined || !validColors || submittingColors} size="sm">Gem</Button>
                </div>
            </footer>
        </div>
        <div class="relative bg-white dark:bg-[#202020] rounded-[6px] border dark:border-gray-600 border-gray-400">
            <div class="relative bg-[inherit] p-6 rounded-t-[6px]">
                <h4 class="mt-0">Hold Navne</h4>
                <p class="text-sm">Her kan du ændre navnene af holdene. Disse vil blandt andet vises på skemaet.</p>
                {#if loading}
                    <Loader2 class="animate-spin w-6 h-6 text-gray-500" />
                {:else if settings == undefined}
                    <p class="text-gray-500">Der skete en fejl. Indstillinger kan ikke ændres for tiden.</p>
                {:else}
                    <div class="space-y-2">
                        {#if classNames.length}
                            {#each classNames as name}
                                <div class="flex space-x-2">
                                    <div class="w-full flex space-x-2">
                                        {#key name.class.name}
                                            <Select bind:value={name.class.name} items={Object.keys(classes)} placeholder="Vælg hold..." />
                                        {/key}
                                        <input bind:value={name.name} placeholder="Skriv navn eller hent oversætning." class="w-full h-11 border dark:border-gray-600 border-gray-400 rounded-[6px] p-2 bg-[inherit] dark:bg-[#2e2e2e]" type="text" />
                                    </div>
                                    <Button disabled={name.name != "" || name.loading} on:click={fetchName(name.class)} size="icon">
                                        {#if name.loading}
                                            <Loader2 class="animate-spin" />
                                        {:else}
                                            <ArrowDownToLine />
                                        {/if}
                                    </Button>
                                    <Button
                                        on:click={() => {
                                            classNames = classNames.filter((entry) => entry != name);
                                        }}
                                        size="icon"><X /></Button
                                    >
                                </div>
                            {/each}
                            <Button
                                on:click={() => {
                                    classNames.push({ class: { name: "", id: "" }, name: "", loading: false });
                                    classNames = classNames;
                                }}
                                size="sm">Tilføj</Button
                            >
                        {:else}
                            <div class="space-x-2">
                                <Button on:click={fetchClasses} disabled={loadingUserClasses}>Hent Dine Hold</Button>
                                <Button
                                    on:click={() => {
                                        classNames.push({ class: { name: "", id: "" }, name: "", loading: false });
                                        classNames = classNames;
                                    }}
                                    variant="secondary">Tilføj Manuelt</Button
                                >
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
            <footer class="flex bg-[inherit] min-h-[60px] px-6 border-t dark:border-t-gray-600 border-t-gray-400 rounded-b-[6px] items-center">
                <p class="my-0 text-gray-500">Automatiske holdnavne bliver hentet fra Lectio.</p>
                <div class="flex items-center justify-end ml-auto">
                    <Button on:click={submitNames} disabled={loading || settings == undefined || !validNames || submittingNames} size="sm">Gem</Button>
                </div>
            </footer>
        </div>
    </div>
</section>
