export const decodeUserID = (cookie: string) => {
    try {
        const data = JSON.parse(window.atob(cookie));
        return data.filter((item) => item.name == "LastLoginElevId")[0].value
    } catch (error) {
        return "12345678";
    }
}