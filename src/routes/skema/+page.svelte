<script lang="ts">
  import type { RawLesson } from "$lib/types/lesson";

  import { authStore } from "$lib/stores";
  import {
    constructInterval,
    contrast,
    hslToRgb,
    stringToColor,
  } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { Calendar, type EventSourceFunc } from "@fullcalendar/core";
  import luxonPlugin from "@fullcalendar/luxon3";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import { DateTime } from "luxon";
  import { onMount } from "svelte";

  const getEvents: EventSourceFunc = function (
    fetchInfo,
    successCallback,
    failureCallback
  ) {
    const start = DateTime.fromJSDate(fetchInfo.start);
    fetch(
      `https://api.betterlectio.dk/skema?id=S${decodeUserID(
        $authStore.cookie
      )}&uge=${start.weekNumber}&år=${start.year}`,
      {
        headers: {
          "lectio-cookie": $authStore.cookie,
        },
      }
    ).then((response) => {
      if (response.ok) {
        response.json().then((data: { moduler: RawLesson[] }) => {
          const events = data.moduler.map((lesson) => {
            const interval = constructInterval(lesson.tidspunkt);
            const start = interval.start?.toISO() ?? "string";
            const end = interval.end?.toISO() ?? "string";

            const color = stringToColor(lesson.hold ?? "", 100, 90);
            const textColor = stringToColor(lesson.hold ?? "", 100, 30);
            const rgb = hslToRgb(color.h, color.s, color.l);
            const textRgb = hslToRgb(textColor.h, textColor.s, textColor.l);
            const ccontrast = contrast(
              [textRgb.b, textRgb.g, textRgb.r],
              [rgb.b, rgb.g, rgb.r]
            );
            console.log(lesson.hold, ccontrast);

            return {
              color: color.string,
              end,
              extendedProps: {
                cancelled: lesson.status === "aflyst",
              },
              id: lesson.absid,
              start,
              textColor: textColor.string,
              title: lesson.navn != null ? lesson.navn : lesson.hold ?? "",
              url: `/modul/${lesson.absid}`,
            };
          });
          successCallback(events);
        });
      } else {
        failureCallback(Error("Could not fetch events"));
      }
    });
  };

  let width: number;
  let calendarEl: HTMLElement;
  let calendar: Calendar;
  onMount(() => {
    calendar = new Calendar(calendarEl, {
      allDaySlot: false,
      contentHeight: "auto",
      dayHeaderContent: function (renderProps) {
        const date = DateTime.fromJSDate(renderProps.date).setLocale("da");
        const todayClasses = renderProps.isToday
          ? "w-8 h-8 rounded-full bg-[#adffb9] dark:bg-[#8678F9]"
          : "";
        const weekday = date.weekdayShort?.replace(".", "")?.toTitleCase();
        return {
          html: `<div class='h-12 flex items-center justify-center py-3'><span class='flex items-baseline font-normal leading-6'>${weekday}<span class='flex items-center justify-center ml-[0.375rem] font-semibold text-black dark:text-white ${todayClasses}'>${date.day}</span></span></div>`,
        };
      },
      dayHeaderFormat: { weekday: "long" },
      eventDidMount: (arg) => {
        arg.event.extendedProps.cancelled &&
          arg.el.classList.add("event-cancelled");
      },
      eventSources: [
        {
          events: getEvents,
        },
      ],
      headerToolbar: {
        left: "title",
        right: "prev,next",
      },
      initialView: width >= 768 ? "timeGridWeek" : "timeGridDay",
      locale: "da",
      nowIndicator: true,
      plugins: [luxonPlugin, timeGridPlugin],
      slotDuration: "00:30:00",
      slotEventOverlap: false,
      slotMaxTime: "18:00",
      slotMinTime: "07:00",
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
</script>

<svelte:window bind:innerWidth={width} />

<div class="page-container">
  <h1 class="mb-0">Skema</h1>
  <div bind:this={calendarEl} class="!mt-0 not-prose" />
  <div class="not-prose block !mt-4">
    <a
      class="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
      href="/skema/sammenlign"
    >
      Se, hvornår dine venner har fri og sammenlign mødetider.
    </a>
  </div>
</div>
