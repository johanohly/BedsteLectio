import type { DateTime } from "luxon";

export type RawForm = {
    dato: string;
    navn: string;
    id: string;
}

export type Form = {
    date: DateTime;
    title: string;
    id: number;
}