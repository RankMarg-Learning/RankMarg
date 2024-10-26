import { atom, selector } from "recoil";
import { useSession } from "next-auth/react";
import { authOptions } from "../../../../apps/frontend/src/app/api/auth/[...nextauth]/options";

export interface User {
  id: string;
  username?: string;
  createdAt?: Date;
  Role?: "ADMIN" | "USER" | "INSTRUCTOR";
  accessToken?: string;
}

// Atom to hold the user state
export const userAtom = atom<User | null>({
  key: "user",
  default: null, // Default is null initially
});

// Selector to fetch user session
export const userSelector = selector<User | null>({
  key: "user/default",
  get: async () => {
    try {
      const { data: session, status } = useSession();
      if (status === "loading") {
        return null;
      }

      if (session) {
        return {
          id: session.user.id,
          username: session.user.username,
          createdAt: session.user.createdAt,
          Role: session.user.Role,
          accessToken: session.user.accessToken,
        };
      }
    } catch (error) {
      console.error("Error fetching user session:", error);
    }
    return null; // Return null if no session
  },
});
