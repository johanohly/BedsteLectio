import type { DateTime } from "luxon";

export type RawFullMessage = {
    beskeder: {
        besked: string;
        bruger: { id: string; navn: string };
        dato: string;
        id: string;
        titel: string;
    }[];
    modtagere: string;
}

export type FullMessage = {
    messages: {
        body: string;
        date: DateTime;
        sender: { id: string, name: string };
        title: string;
    }[];
    receivers: string;
}

export type RawMessage = {
    dato: string;
    emne: string;
    "førsteBesked": string;
    message_id: string;
    modtagere: string[];
    senesteBesked: string;
    "ændret": string;
}

export type Message = {
    date: DateTime;
    id: number;
    receivers: string[];
    sender: string;
    title: string;
}

export type RawSimpleMessage = {
    afsender: string;
    dato: string;
    id: string;
    navn: string;
}

export type SimpleMessage = {
    date: DateTime;
    id: number;
    sender: string;
    title: string;
}