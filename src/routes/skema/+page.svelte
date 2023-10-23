<script lang="ts">
  import type { RawLesson } from "$lib/types/lesson";

  import { authStore } from "$lib/stores";
  import { constructInterval, constructNonceURL, stringToColor } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { Calendar, type EventSourceFunc } from "@fullcalendar/core";
  import luxonPlugin from "@fullcalendar/luxon3";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import daLocale from "@fullcalendar/core/locales/da";
  import tippy from "tippy.js";
  import "$lib/tippy.css";
  import DOMPurify from "dompurify";
  import { DateTime } from "luxon";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { addToast } from "$components/toaster";
  import { goto } from "$app/navigation";
  import { Date } from "$components/ui/date";
  import { CalendarDays } from "lucide-svelte";

  const nameRegex = /^(?:[\w]+) (.*)(?:,.*)/gm;

  let userId: string;
  let searchId: string;
  let userName = "";

  const getEvents: EventSourceFunc = (fetchInfo, successCallback, failureCallback) => {
    const start = DateTime.fromJSDate(fetchInfo.start);

    fetch(constructNonceURL(`https://api.betterlectio.dk/skema?id=${userId}&uge=${start.weekNumber}&år=${start.year}`), {
      headers: {
        "lectio-cookie": $authStore.cookie,
      },
    }).then((response) => {
      if (!response.ok) {
        if ($authStore.username != "" && $authStore.password != "") {
          fetch(constructNonceURL("https://api.betterlectio.dk/auth"), {
            headers: {
              adgangskode: $authStore.password,
              brugernavn: $authStore.username,
              skoleid: String($authStore.school),
            },
          }).then((response) => {
            if (response.ok) {
              $authStore.cookie = response.headers.get("set-lectio-cookie") ?? "";
              fetch(constructNonceURL(`https://api.betterlectio.dk/skema?id=${userId}&uge=${start.weekNumber}&år=${start.year}`), {
                headers: {
                  "lectio-cookie": $authStore.cookie,
                },
              }).then((response) => {
                if (!response.ok) {
                  $authStore.username = "";
                  $authStore.password = "";
                  $authStore.cookie = "";
                  return goto("/log-ind");
                }
              });
            } else {
              $authStore.username = "";
              $authStore.password = "";
              $authStore.cookie = "";
              return goto("/log-ind");
            }
          });
        } else {
          $authStore.cookie = "";
          return goto("/log-ind");
        }
      }

      response.json().then((data: { moduler: RawLesson[]; overskrift: string }) => {
        if (userId.startsWith("S")) {
          const matches = nameRegex.exec(data.overskrift);
          if (matches) {
            userName = matches[1];
          } else {
            userName = data.overskrift;
          }
        } else {
          userName = data.overskrift.replace("Lokalet ", "").replace(" - Skema", "");
        }
        const events = data.moduler.map((lesson) => {
          const interval = constructInterval(lesson.tidspunkt);
          const start = interval.start?.toISO() ?? "string";
          const end = interval.end?.toISO() ?? "string";

          const color = stringToColor(lesson.hold ?? "", 100, 90);
          const textColor = stringToColor(lesson.hold ?? "", 100, 30);

          return {
            color: color.string,
            end,
            extendedProps: {
              cancelled: lesson.status === "aflyst",
              description: `${lesson.navn ? `${lesson.navn}<br>` : ""}${lesson.tidspunkt}<br>Hold: ${lesson.hold}<br>Lærer: ${lesson.lærer}<br>Lokale: ${lesson.lokale}${lesson.andet ? `<br><br>${lesson.andet}` : ""}`,
            },
            id: lesson.absid,
            start,
            textColor: textColor.string,
            title: `${lesson.navn ?? lesson.hold}${lesson.lokale ? ` • ${lesson.lokale}` : ""}`,
            url: `/modul/${lesson.absid}`,
          };
        });
        successCallback(events);
      });
    });
  };

  let loading = true;
  let width: number;
  let calendarEl: HTMLElement;
  let calendar: Calendar;
  let showBackToWeekViewButton = false;

  onMount(() => {
    searchId = $page.url.searchParams.get("id") ?? "";
    const meId = `S${decodeUserID($authStore.cookie)}`;
    if (searchId) {
      if (searchId.length == 12 && (searchId.startsWith("S") || searchId.startsWith("T") || searchId.startsWith("H") || searchId.startsWith("R")) && !isNaN(Number(searchId.slice(1)))) {
        userId = searchId;
      } else {
        addToast({
          data: {
            title: "Ugyldigt ID",
            description: "Det ID du har indtastet er ugyldigt. Viser eget skema.",
            color: "bg-red-500",
          },
        });
        userId = meId;
      }
      goto(`/skema`, { replaceState: true });
    } else {
      userId = meId;
    }

    calendar = new Calendar(calendarEl, {
      allDaySlot: false,
      contentHeight: "auto",
      dayHeaderContent: function (renderProps) {
        const date = DateTime.fromJSDate(renderProps.date).setLocale("da");
        const todayClasses = renderProps.isToday ? "w-8 h-8 rounded-full bg-[#adffb9] dark:bg-[#8678F9]" : "";
        const weekday = date.weekdayShort?.replace(".", "")?.toTitleCase();
        return {
          html: `<div class='h-12 flex items-center justify-center py-3'><span class='flex items-baseline font-normal leading-6'>${weekday}<span class='flex items-center justify-center ml-[0.375rem] font-semibold text-black dark:text-white ${todayClasses}'>${date.day}</span></span></div>`,
        };
      },
      dayHeaderFormat: { weekday: "long" },
      eventDidMount: (arg) => {
        tippy(arg.el, {
          content: DOMPurify.sanitize(arg.event.extendedProps.description, { USE_PROFILES: { html: true } }),
          placement: "top",
          duration: 0,
          allowHTML: true,
        });
        if (arg.event.extendedProps.cancelled) arg.el.classList.add("event-cancelled");
      },
      eventSources: [
        {
          events: getEvents,
        },
      ],
      loading(isLoading) {
        loading = isLoading;
      },
      headerToolbar: {
        left: "title",
        right: "today prev,next",
      },
      initialView: width >= 768 ? "timeGridWeek" : "timeGridDay",
      locale: daLocale,
      nowIndicator: true,
      plugins: [luxonPlugin, timeGridPlugin],
      slotDuration: "00:30:00",
      slotEventOverlap: false,
      slotMaxTime: "18:00",
      slotMinTime: "07:00",
      navLinks: true,
      navLinkDayClick(date, jsEvent) {
        calendar.gotoDate(date);
        calendar.changeView("timeGridDay");
        showBackToWeekViewButton = true;
      },
      titleFormat: "Uge W, yyyy",
      weekends: false,
      windowResize: function () {
        calendar.changeView(width >= 768 ? "timeGridWeek" : "timeGridDay");
      },
    });
    calendar.render();

    return () => {
      calendar && calendar.destroy();
    };
  });

  let customDate: string;
  $: if (customDate) {
    const date = DateTime.fromISO(customDate);
    if (date.isValid) {
      calendar.gotoDate(date.toJSDate());
    }
  }
</script>

<svelte:window bind:innerWidth={width} />

<div class="page-container">
  <div class="flex items-center justify-between">
    <div class="flex space-x-4">
      <h1 class="mb-0">Skema {userId === searchId ? `(${userName})` : ""}</h1>
      {#if loading}
        <span class="loader" />
      {/if}
    </div>
    <div class="flex space-x-3">
      {#if showBackToWeekViewButton}
        <button
          on:click={() => {
            calendar.changeView("timeGridWeek");
            showBackToWeekViewButton = false;
          }}
          class="rounded h-10 px-3 bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black border-gray-700">Ugevisning</button
        >
      {/if}
      <Date class="rounded h-10 px-3 bg-dark hover:bg-dark-hover dark:bg-light dark:hover:bg-light-hover text-white dark:text-black border-gray-700" bind:value={customDate}><CalendarDays /></Date>
    </div>
  </div>
  <div bind:this={calendarEl} class="!mt-0 not-prose" />
  <div class="not-prose block !mt-4">
    <a class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300" href="/skema/sammenlign"> Se, hvornår dine venner har fri og sammenlign mødetider. </a>
  </div>
  {#if userId === searchId}
    <p class="mt-0 text-sm text-gray-500">Genindlæs siden for at se dit eget skema.</p>
  {/if}
</div>

<style>
  .loader {
    border: 20px solid #fff;
    border-bottom-color: #adffb9;
    border-radius: 50%;
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }
  :is(.dark .loader) {
    border: 20px solid #1e1e1e;
    border-bottom-color: #8678f9;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
