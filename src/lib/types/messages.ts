import type { DateTime } from "luxon";

export type RawMessage = {
    afsender: string;
    dato: string;
    id: string;
    navn: string;
}

export type Message = {
    sender: string;
    date: DateTime;
    id: number;
    title: string;
}