import { DateTime, Interval } from "luxon";

export const constructInterval = (input: string) => {
    const parts = input.split(" ");
    if (parts.length !== 4) {
        return Interval.invalid("Invalid input string for interval");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [date, fromTime, _, toTime] = parts;
    const from = DateTime.fromFormat(`${date} ${fromTime}`, "d/M-yyyy HH:mm", { locale: "da" });
    const to = DateTime.fromFormat(`${date} ${toTime}`, "d/M-yyyy HH:mm", { locale: "da" });
    return Interval.fromDateTimes(from, to)
};