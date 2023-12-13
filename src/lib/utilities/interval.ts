import { DateTime, Interval } from "luxon";

export const constructInterval = (input: string) => {
    const parts = input.split(" ");
    let fromDate, fromTime, toDate, toTime;
    if (parts.length === 4) {
        [fromDate, fromTime, , toTime] = parts;
        toDate = fromDate
    } else if (parts.length === 5) {
        [fromDate, fromTime, , toDate, toTime] = parts;
    } else {
        return Interval.invalid("Invalid input string for interval");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const from = DateTime.fromFormat(`${fromDate} ${fromTime}`, "d/M-yyyy HH:mm", { locale: "da" });
    const to = DateTime.fromFormat(`${toDate} ${toTime}`, "d/M-yyyy HH:mm", { locale: "da" });
    return Interval.fromDateTimes(from, to)
};