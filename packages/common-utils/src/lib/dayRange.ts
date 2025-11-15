import { addDays, setHours, setMinutes, setSeconds } from 'date-fns';

/**
 * Returns the UTC time window corresponding to 11:50 PM IST today to 11:50 PM IST tomorrow.
 */
export function getDayWindow(): { from: Date; to: Date } {
    const IST_OFFSET_MS: number = 5.5 * 60 * 60 * 1000; // +5:30 in milliseconds

    const now: Date = new Date();
    const istNow: Date = new Date(now.getTime() + IST_OFFSET_MS);

    // Set time to 11:50 PM IST
    let ist1150PM: Date = setSeconds(setMinutes(setHours(istNow, 23), 50), 0);

    // If IST time now is before 11:50 PM, use today; otherwise, shift to next day
    if (istNow.getHours() < 23 || (istNow.getHours() === 23 && istNow.getMinutes() < 50)) {
        ist1150PM = addDays(ist1150PM, -1);
    }

    const from: Date = new Date(ist1150PM.getTime() - IST_OFFSET_MS);
    const to: Date = new Date(from.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

    return { from, to };
}
