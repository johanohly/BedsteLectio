<script lang="ts">
  import { authStore } from "$lib/stores";
  import type { RawLesson } from "$lib/types/lesson";
  import { constructInterval, contrast, hslToRgb, stringToColor } from "$lib/utilities";
  import { decodeUserID } from "$lib/utilities/cookie";
  import { Calendar, type EventSourceFunc } from "@fullcalendar/core";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import luxonPlugin from "@fullcalendar/luxon3";
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
              id: lesson.absid,
              url: `/modul/${lesson.absid}`,
              start,
              end,
              title: lesson.navn != null ? lesson.navn : lesson.hold ?? "",
              color: color.string,
              textColor: textColor.string,
              extendedProps: {
                cancelled: lesson.status === "aflyst",
              },
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
    console.log(width);
    calendar = new Calendar(calendarEl, {
      plugins: [luxonPlugin, timeGridPlugin],
      initialView: width >= 768 ? "timeGridWeek" : "timeGridDay",
      contentHeight: "auto",
      locale: "da",
      headerToolbar: {
        left: "title",
        right: "prev,next",
      },
      titleFormat: "Uge W, yyyy",
      allDaySlot: false,
      dayHeaderFormat: { weekday: "long" },
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
      eventDidMount: (arg) => {
        arg.event.extendedProps.cancelled &&
          arg.el.classList.add("event-cancelled");
      },
      nowIndicator: true,
      weekends: false,
      slotDuration: "00:30:00",
      slotMinTime: "07:00",
      slotMaxTime: "18:00",
      slotEventOverlap: false,
      eventSources: [
        {
          events: getEvents,
        },
      ],
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
  <!-- <div class="p-8 bg-white rounded-md"> -->
  <div class="!mt-0 not-prose" bind:this={calendarEl} />
  <!-- </div> -->
</div>
