<script lang="ts">
  import type { RawLesson } from "$lib/types/lesson";

  import { RequestData } from "$components";
  import { authStore } from "$lib/stores";
  import { constructInterval, nameBlacklisted } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import JSConfetti from "js-confetti";
  import { DateTime } from "luxon";

  const confetti = new JSConfetti();

  let hours = "00";
  let minutes = "00";
  let seconds = "00";
  let endTime: DateTime | null = null;
  const dt = DateTime.local();

  let loading = true;
  let data: { moduler: RawLesson[] };
  $: if (!loading && data) {
    let lastLessonEnd = DateTime.local();
    for (let i = 0; i < data.moduler.length; i++) {
      if (data.moduler[i].status != "aflyst" && !nameBlacklisted(data.moduler[i].navn ?? ("" && data.moduler[i].tidspunkt.includes(dt.toFormat("d/M-yyyy"))))) {
        const { end } = constructInterval(data.moduler[i].tidspunkt);
        if (end && lastLessonEnd < end) {
          lastLessonEnd = end;
        }
      }
    }
    endTime = lastLessonEnd;
  }

  async function end() {
    await confetti.addConfetti({
      confettiNumber: 100,
      emojis: ["🧷", "🔧", "🧪", "💻", "📚", "✏"],
    });
    await confetti.addConfetti({
      confettiNumber: 100,
      emojis: ["🧷", "🔧", "🧪", "💻", "📚", "✏"],
    });
  }

  let intervalID: NodeJS.Timeout;
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
  $: marginLeft = `${width / 7}px`;
</script>

<svelte:window bind:innerWidth={width} />
<RequestData bind:data bind:loading path={`skema?id=S${decodeUserID($authStore.cookie)}&uge=${dt.weekNumber}&år=${dt.year}`} />

<div class="">
  <time class="clock-font pulsate" style="margin-left: {marginLeft}; font-size: {fontSize}">{hours}:{minutes}:{seconds}</time>
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
