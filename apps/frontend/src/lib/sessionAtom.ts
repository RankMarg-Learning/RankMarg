import { atom } from "recoil";
import { Session } from "next-auth";

export const sessionAtom = atom<Session | null>({
  key: "sessionAtom",
  default: null, // The default value is null, meaning no user is logged in
});
