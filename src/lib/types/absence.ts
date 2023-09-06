import type { RawLesson } from "./lesson";

export type RawAbsence = {
    moduler: {
        oversigt: {
            årsag: "Skolerelaterede aktiviteter" | "Private forhold" | "Kom for sent" | "Sygdom" | "Anden";
            type: "Lektion" | string;
            aktivitet: RawLesson;
            fraværstype: string;
            registreret: string;
            bemærkning: string;
            årsagsnote: string;
            fravær: string;
            lærer: string;
            uge: string;
        }[];
        manglende_fraværsårsager: {
            type: "Lektion" | string;
            aktivitet: RawLesson;
            fraværstype: string;
            registreret: string;
            fravær: string;
            lærer: string;
            uge: string;
        }[];
    };
    generalt: {
        heleåret_fravær_moduler: string;
        heleåret_fravær_procent: string;
        opgjort_fravær_moduler: string;
        opgjort_fravær_procent: string;
        hold: string;
    }[];
    grafisk_oversigt: string;
}