import type { DateTime } from "luxon";

export type RawForm = {
    dato: string;
    id: string;
    navn: string;
}

export type Form = {
    date: DateTime;
    id: number;
    title: string;
}