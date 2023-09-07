export function notEmpty<TValue>(value: undefined | TValue | null): value is TValue {
    return value !== null && value !== undefined;
}