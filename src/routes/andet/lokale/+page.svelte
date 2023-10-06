<script lang="ts">
    import { RequestData } from "$components";
    import { authStore } from "$lib/stores";
    import type { RawLesson } from "$lib/types/lesson";
    import { constructInterval } from "$lib/utilities";
    import { decodeUserID } from "$lib/utilities/cookie";
    import { DateTime } from "luxon";

    let loading = true;
    let data: { moduler: RawLesson[] };
    let nextRoomData: { title: string; time: DateTime };
    let nextRoom = { text: "Loading", fontSize: 10 };
    $: if (!loading && data) {
        const events = data.moduler.map((lesson) => {
            const interval = constructInterval(lesson.tidspunkt);
            const start = interval.start ?? DateTime.now();

            return {
                title: lesson.navn ? `${lesson.navn} (${lesson.hold})` : lesson.hold ?? "Ikke angivet",
                room: lesson.lokale ?? "N/A",
                start,
            };
        });
        const nextEvent = events.find((event) => event.start > DateTime.now());
        if (nextEvent) {
            nextRoomData = { title: nextEvent.title, time: nextEvent.start };
            nextRoom = { text: nextEvent.room, fontSize: Math.min(150 / nextEvent.room.length, 30) };
        }
    }
</script>

<RequestData bind:loading bind:data path={`skema?id=S${decodeUserID($authStore.cookie)}&uge=${DateTime.now().weekNumber + (DateTime.now().weekdayShort?.containsAny(["Sat", "Sun"]) ? 1 : 0)}&år=${DateTime.now().year}`} />

<div class="flex flex-col items-center justify-center not-prose">
    {#if nextRoomData}
        <span class="text-center w-[90vw] font-mono whitespace-nowrap overflow-hidden overflow-ellipsis" style={`font-size: ${nextRoom.fontSize / 6}vw`}>{nextRoomData.title}</span>
    {/if}
    <!-- <span class="font-mono leading-none" style={`font-size: ${nextRoom.fontSize}vw`}>{nextRoom.room}</span> -->
    <ul class="text-container">
        {#each nextRoom.text.split(/.*?/u) as char}
            <li>
                <span style={`font-size: ${nextRoom.fontSize}vw`}>
                    {#if char !== " "}
                        {char}
                    {:else}
                        &nbsp;
                    {/if}
                </span>
            </li>
        {/each}
    </ul>
    {#if nextRoomData}
        <span class="font-mono" style={`font-size: ${nextRoom.fontSize / 6}vw`}>{nextRoomData.time.toRelative()}</span>
    {/if}
</div>

<style>
    .text-container {
        border-radius: 10px;
        border: 1px solid #eee;
        box-shadow: 10px 10px 50px 5px #aaa;
        counter-reset: num-chars;
        overflow: hidden;
    }
    :is(.dark .text-container) {
        border-color: #3f3f3f;
        box-shadow: 10px 10px 50px 5px #333;
    }

    .text-container li {
        counter-increment: num-chars;
        display: flex;
        flex-direction: column;
        float: left;
        font-family: monospace;
        font-size: 10vw;
        line-height: 1;
    }

    .text-container li:nth-child(odd) {
        @apply bg-white dark:bg-dark;
    }

    .text-container li:nth-child(even) {
        @apply bg-[#f7f7f7] dark:bg-dark-hover;
    }

    .text-container li::after {
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        color: #aaa;
        content: counter(num-chars);
        display: block;
        font-size: 1.5vw;
        text-align: center;
        user-select: none;
    }
</style>
