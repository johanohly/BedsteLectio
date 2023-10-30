export const isColorValid = (color: string) => {
    if (!color) return false;

    const number = +color;
    if (isNaN(number) || number < 0 || number > 360) return false;
    return true;
};