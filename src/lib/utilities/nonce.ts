import { DateTime } from "luxon";

export const constructNonceURL = (originalUrl: string): string => {
    const nonce = DateTime.now().toMillis().toString();
    const url = new URL(originalUrl);
    url.searchParams.set('nonce', nonce);
    return url.toString();
}