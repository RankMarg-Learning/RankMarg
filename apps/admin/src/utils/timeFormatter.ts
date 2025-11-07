type TimeUnit = 'sec' | 'min' | 'hr';

interface FormatTimeOptions {
    from: TimeUnit;
    to: [TimeUnit, TimeUnit]; // e.g. ['hr', 'min'] or ['min', 'sec']
}

/**
 * Converts time from one unit to a composite format like [hr, min] or [min, sec]
 * @param value Numeric input (e.g., 90)
 * @param options { from: 'min', to: ['hr', 'min'] }
 * @returns string like "1 hr 30 min", skips 0 values
 */
export function timeFormator(value: number, options: FormatTimeOptions): string {
    const inSeconds = {
        sec: 1,
        min: 60,
        hr: 3600,
    };

    const { from, to } = options;

    if (!inSeconds[from] || !inSeconds[to[0]] || !inSeconds[to[1]]) {
        throw new Error(`Invalid time unit provided in options`);
    }

    // Convert input to seconds
    let totalSeconds = value * inSeconds[from];

    const firstUnitSeconds = inSeconds[to[0]];
    const secondUnitSeconds = inSeconds[to[1]];

    const firstValue = Math.floor(totalSeconds / firstUnitSeconds);
    totalSeconds %= firstUnitSeconds;

    const secondValue = Math.floor(totalSeconds / secondUnitSeconds);

    const parts: string[] = [];
    if (firstValue > 0) parts.push(`${firstValue} ${to[0]}`);
    if (secondValue > 0) parts.push(`${secondValue} ${to[1]}`);

    return parts.join(' ') || `0 ${to[1]}`;
}
