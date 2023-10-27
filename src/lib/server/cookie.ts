import { decodeUserID } from "$lib/utilities/cookie";

export const validateCookie = async (cookie: string) => {
    const response = await fetch("https://api.bedstelectio.tech/check-cookie", {
        headers: {
            "lectio-cookie": cookie
        }
    })
    const { valid } = await response.json();
    if (!valid) return undefined;

    return decodeUserID(cookie);
}