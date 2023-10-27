export const decodeUserID = (cookie: string): string => {
    try {
        let data = []
        if (window) JSON.parse(window.atob(cookie))
        else data = JSON.parse(Buffer.from(cookie, "base64").toString());
        return data.filter((item) => item.name == "LastLoginElevId")[0].value
    } catch (error) {
        console.log(error);
        return "54443227086"; // My user id xD
    }
}