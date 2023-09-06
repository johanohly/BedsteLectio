import type { DateTime } from "luxon";

type RawUser = {
    bruger_id: string;
    navn: string;
}

type RawDocument = {
    bruger: RawUser;
    dokument: string;
    "indlæg": string;
    tidspunkt: string;
}

export type RawAssignment = {
    afleveres_af: {
        afsluttet: boolean;
        afventer: string;
        elev: RawUser;
        elevnote: string;
        karakter: string;
        karakternote: string;
        "status_fravær": string;
    };
    gruppemedlemmer: RawUser[];
    "opgave_indlæg": RawDocument[];
    oplysninger: {
        afleveringsfrist: string;
        ansvarlig: RawUser;
        elevtid: string;
        hold: string;
        i_undervisningsbeskrivelse: "Ja" | "Nej";
        karakterskala: string;
        opgavebeskrivelse: string | null;
        opgavenote: string;
        opgavetitel: string;
    };
};

type User = {
    id: string;
    name: string;
}

type Document = {
    url: string | null;
    name: string | null;
    date: DateTime;
    user: User;
};

export type Assignment = {
    title: string;
    description: string;
    details: string;
    status: string;
    date: DateTime;
    billedTime: string;
    class: string;
    documents: Document[];
    participants: User[];
};

export type SimpleAssignment = {
    title: string;
    description: string;
    date: DateTime;
    status: "Afleveret" | "Venter" | "Mangler";
    hold: string;
    link: string;
};

export type RawSimpleAssignment = {
    afventer: "Elev" | "Lærer" | "";
    "elev-tid": string;
    elevnote: string;
    exerciseid: string;
    "fravær": string;
    frist: string;
    hold: string;
    karakter: string;
    opgavenote: string;
    opgavetitel: string;
    status: "Afleveret" | "Venter" | "Mangler";
    uge: string;
}