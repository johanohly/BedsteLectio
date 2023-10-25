export const decodeUserID = (cookie: string): string => {
    try {
        const data = JSON.parse(Buffer.from(cookie, "base64").toString());
        return data.filter((item) => item.name == "LastLoginElevId")[0].value
    } catch (error) {
        return "54443227086"; // My user id xD
    }
}