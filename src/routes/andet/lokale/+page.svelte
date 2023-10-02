<script lang="ts">
    import { RequestData } from "$components";
    import { authStore } from "$lib/stores";
    import type { RawLesson } from "$lib/types/lesson";
    import { constructInterval } from "$lib/utilities";
    import { decodeUserID } from "$lib/utilities/cookie";
    import { DateTime } from "luxon";

    let loading = true;
    let data: { moduler: RawLesson[] };
    let nextRoom: { title: string; room: string; time: DateTime; fontSize: number };
    $: if (!loading && data) {
        const events = data.moduler.map((lesson) => {
            const interval = constructInterval(lesson.tidspunkt);
            const start = interval.start ?? DateTime.now();

            return {
                title: lesson.navn ? `${lesson.navn} (${lesson.hold})` : lesson.hold ?? "Ikke angivet",
                room: lesson.lokale ?? "Ikke angivet",
                start,
            };
        });
        const nextEvent = events.find((event) => event.start > DateTime.now());
        if (nextEvent) {
            nextRoom = { title: nextEvent.title, room: nextEvent.room, time: nextEvent.start, fontSize: Math.min(150 / nextEvent.room.length, 30) };
        }
    }
</script>

<RequestData bind:loading bind:data path={`skema?id=S${decodeUserID($authStore.cookie)}&uge=${DateTime.now().weekNumber + (DateTime.now().weekdayShort?.containsAny(["Sat", "Sun"]) ? 1 : 0)}&år=${DateTime.now().year}`} />

{#if nextRoom}
    <div class="flex flex-col items-center justify-center">
        <span class="w-[90vw] font-mono whitespace-nowrap overflow-hidden overflow-ellipsis" style={`font-size: ${nextRoom.fontSize / 6}vw`}>{nextRoom.title}</span>
        <span class="font-mono leading-none" style={`font-size: ${nextRoom.fontSize}vw`}>{nextRoom.room}</span>
        <span class="font-mono" style={`font-size: ${nextRoom.fontSize / 6}vw`}>{nextRoom.time.toRelative()}</span>
    </div>
{:else}
    loading...
{/if}
