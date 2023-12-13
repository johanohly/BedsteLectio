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
    groups: { name: string; isMe: boolean; members: { name: string; id: string; me: boolean }[] }[]
    presentation: null | string;
}

export type RawModule = {
    aktivitet: RawLesson;
    lektier: null | string;
    note: null | string;
    "præsentation": null | string;
    "øvrigtIndhold": null | string;
    grupper: Record<string, string[]>;
}