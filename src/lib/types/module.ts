import type { Interval } from "luxon";
import type { RawLesson } from "./lesson"

export type Module = {
    homework: null | string;
    lesson: {
        class: string;
        name: string;
        interval: Interval;
        room: string;
        teacher: string;
    };
    note: null | string;
    otherContent: null | string;
    presentation: null | string;
}

export type RawModule = {
    aktivitet: RawLesson;
    lektier: null | string;
    note: null | string;
    "præsentation": null | string;
    "øvrigtIndhold": null | string;
}