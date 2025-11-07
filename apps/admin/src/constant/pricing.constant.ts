
export const Year1May = new Date(new Date().getFullYear() + (new Date() > new Date(new Date().getFullYear(), 4, 1) ? 1 : 0), 4, 1);

export const Year2May = new Date(new Date().getFullYear() + 2, 4, 1);

export const DEFAULT_PLAN_DISCOUNT = 50; 

export const plans = [
    {
        plandId: "99221f06-084f-4ce3-8bac-6a5147e6aa21",
        label: "Till  2026",
        tillDate: Year1May,
        days: 365,
        current: 2499,
        original: 3499,
    },
    {
        plandId: "99221f06-084f-4ce3-8bac-6a5147e6aa22",
        label: "Till  2027",
        tillDate: Year2May,
        days: 730,
        current: 4999,
        original: 6499,
    },
];
