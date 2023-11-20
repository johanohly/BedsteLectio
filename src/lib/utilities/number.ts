export const round = (num: number, places = 0): number => {
    const factor = 10 ** places
    return Math.round(num * factor) / factor
}