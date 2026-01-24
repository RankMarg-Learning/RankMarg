export const IST_OFFSET_MINUTES = 5.5 * 60;
export const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

export function getISTDate(date: Date = new Date()): Date {
    return new Date(date.getTime() + IST_OFFSET_MS);
}

export function convertISTtoUTC(istDate: Date): Date {
    return new Date(istDate.getTime() - IST_OFFSET_MS);
}