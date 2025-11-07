export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma"
import { ActivityType } from "@/constant/activities";
import { getAuthSession } from "@/utils/session";



export async function GET(){
  try {
    const session = await getAuthSession()
    if (!session) {
      return new Response("User not found", { status: 404 });
    }

  const userEmail = session.user?.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, username: true, phone: true, standard: true, location: true, avatar: true,targetYear:true,email:true, studyHoursPerDay:true },
    })
    return new Response(JSON.stringify(user),{status:200})
  } catch (error) {
    console.error("[User-Dynamic] :", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  const updates = await req.json();
  console.log(updates)
  try {
    const session = await getAuthSession()
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userEmail = session.user?.email
    
    // Get current user data to check for empty fields
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true, 
        coins: true, 
        ...Object.fromEntries(Object.keys(updates).map(k => [k, true]))
      }
    })

    if (!currentUser) {
      return new Response("User not found", { status: 404 });
    }

    // Calculate coins to add and track updated fields
    const updatedFields: string[] = [];
    const coinsToAdd = Object.entries(updates).reduce((coins, [field, value]) => {
      if (!currentUser[field] && value) {
        updatedFields.push(field);
        return coins + 2;
      }
      return coins;
    }, 0);

    // Use transaction to ensure both user update and activity creation succeed
    const user = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { email: userEmail },
        data: {
          ...updates,
          coins: {
            increment: coinsToAdd
          }
        },
      });

      // Create activity record if coins were awarded
      if (coinsToAdd > 0) {
        await tx.activity.create({
          data: {
            userId: currentUser.id,
            type: ActivityType.PROFILE,
            message: `Completed profile fields: ${updatedFields.join(", ")}`,
            earnCoin: coinsToAdd
          }
        });
      }

      return updatedUser;
    });
    
    return new Response(JSON.stringify({ ...user, coinsAwarded: coinsToAdd }), { status: 200 })
  } catch (error) {
    console.error("[Profile-Update] :", error.message);
    return new Response("Internal Server Error", { status: 500 });
  }
}

