import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function getAuthSession() {
    return await getServerSession(authOptions)
}