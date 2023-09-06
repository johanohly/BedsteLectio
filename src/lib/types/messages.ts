import type { DateTime } from "luxon";

export type RawMessage = {
    afsender: string;
    dato: string;
    navn: string;
    id: string;
}

export type Message = {
    sender: string;
    date: DateTime;
    title: string;
    id: number;
}