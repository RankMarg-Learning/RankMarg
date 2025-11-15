import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decodeURLParam = (param: string) => {
    return decodeURIComponent(param.replace(/%20/g, ' '));
};
