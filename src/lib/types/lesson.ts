import type { Interval } from "luxon";

export type RawLesson = {
    status: "eksamen" | "normal" | "aflyst" | "ændret" | string | null;
    hold_id: string | null;
    lokale: string | null;
    lærer: string | null;
    andet: string | null;
    navn: string | null;
    hold: string | null;
    tidspunkt: string;
    absid: string;
};

export type Lesson = {
    interval: Interval;
    teacher: string;
    status: string;
    class: string;
    name: string;
    room: string;
    note: string;
    id: string;
}