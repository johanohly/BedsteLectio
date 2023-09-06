import type { Interval } from "luxon";

export type RawLesson = {
    navn: string | null;
    tidspunkt: string;
    hold: string | null;
    hold_id: string | null;
    lærer: string | null;
    lokale: string | null;
    status: string | "normal" | "aflyst" | "eksamen" | "ændret" | null;
    absid: string;
    andet: string | null;
};

export type Lesson = {
    id: string;
    name: string;
    class: string;
    teacher: string;
    status: string;
    room: string;
    note: string;
    interval: Interval;
}