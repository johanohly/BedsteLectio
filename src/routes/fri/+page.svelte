<script lang="ts">
  import { authStore } from "$lib/stores";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { DateTime } from "luxon";
  import JSConfetti from "js-confetti";
  import { constructInterval } from "$lib/utilities";
  import { RequestData } from "$components";
  import type { RawLesson } from "$lib/types/lesson";

  const confetti = new JSConfetti();

  function nameBlacklisted(name: string) {
    // TODO: Check notes for "frivillig" string (very rare)
    if (name == null) {
      return false;
    }
    name = name.toLowerCase();

    if (["obligatorisk"].some((x) => name.includes(x))) {
      return false;
    }
    if (
      [
        "café",
        "cafe",
        "klub",
        "club",
        "fri",
        "konkurrence",
        "mesterskab",
        "workshop",
        "kemi ol",
        "kemi-ol"
      ].some((x) => name.includes(x))
    ) {
      return true;
    }
    return false;
  }

  let hours = "00";
  let minutes = "00";
  let seconds = "00";
  let endTime: DateTime | null = null;
  const dt = DateTime.local();

  let loading: boolean = true;
  let data: { moduler: RawLesson[] };
  $: if (!loading && data) {
    let endLesson: string | undefined = undefined;
    for (let i = 0; i < data.moduler.length; i++) {
      if (data.moduler[i].status != "aflyst") {
        if (!nameBlacklisted(data.moduler[i].navn ?? "")) {
          if (data.moduler[i].tidspunkt.includes(dt.toFormat("d/M-yyyy"))) {
            endLesson = data.moduler[i].tidspunkt;
          }
        }
      }
    }
    if (endLesson) {
      const end = constructInterval(endLesson).end;
      if (end && end < dt) {
        endTime = null;
      } else {
        endTime = end;
      }
    }
  }

  async function end() {
    await confetti.addConfetti({
      emojis: ["🧷", "🔧", "🧪", "💻", "📚", "✏"],
      confettiNumber: 500,
    });
    await confetti.addConfetti({
      emojis: ["🧷", "🔧", "🧪", "💻", "📚", "✏"],
      confettiNumber: 500,
    });
  }

  let intervalID: number;
  $: if (endTime !== null) {
    intervalID = setInterval(async () => {
      if (endTime) {
        const dt = DateTime.local();
        const diff = endTime.diff(dt, ["hours", "minutes", "seconds"]);
        hours = diff.hours.toString().padStart(2, "0");
        minutes = diff.minutes.toString().padStart(2, "0");
        seconds = Math.floor(diff.seconds).toString().padStart(2, "0");
        if (hours == "00" && minutes == "00" && seconds == "00") {
          endTime = null;
          await end();
          return clearInterval(intervalID);
        }
      }
    }, 100); // 100 so it basically syncs with the system clock
  }

  let width = 24;
  $: fontSize = `${width / 6}px`;
  $: marginLeft = `${(width) / 7}px`;
</script>

<svelte:window bind:innerWidth={width} />
<RequestData
  bind:data
  bind:loading
  path={`skema?id=S${decodeUserID($authStore.cookie)}&uge=${dt.weekNumber}&år=${
    dt.year
  }`}
/>

<div class="">
  <time style="margin-left: {marginLeft}; font-size: {fontSize}" class="clock-font pulsate"
    >{hours}:{minutes}:{seconds}</time
  >
</div>

<style>
  @font-face {
    font-family: "TimeTraveler";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/TimeTravelerPal-Normal-Regular.ttf") format("truetype");
  }
  .clock-font {
    font-family: "TimeTraveler", Arial, sans-serif;
    font-weight: 400;
  }
</style>
