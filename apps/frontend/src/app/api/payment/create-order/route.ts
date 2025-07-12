import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

export async function POST(req:Request){
    try {
        const body = await req.json();
        const { planId, amount , duration } = body;
    
        if (!planId || !amount || !duration) {
        return jsonResponse(null,{message:"Missing required fields: planId, amount, or duration",success:false,status:400} );
        }
        
        const session = await getAuthSession();
        if (!session || !session.user) {
            return jsonResponse(null, { message: "Unauthorized", success: false, status: 401 });
        }

        const userId = session.user.id;
        const userEmail = session.user.email;

        const receipt = `order_${userEmail}_${userId}`.slice(0,40)
        
        const order = await razorpay.orders.create({
            amount:Math.round(amount*100),
            currency:"INR",
            receipt: receipt,
            notes:{
                email: userEmail,
                planId: planId,
                duration: duration,
            }
        })
        if (!order) {
            return jsonResponse(null, { message: "Failed to create order", success: false, status: 500 });
        }

        const subscription = await prisma.subscription.findFirst({
            where:{
                userId: userId,
            },
            select:{
                id: true,

            }
        })
        if (!subscription) {
            return jsonResponse(null, { message: "Subscription not found", success: false, status: 404 });
        }
         await prisma.payment.create({
            data: {
                amount,
                currency: "INR",
                status: "PENDING",
                provider: "PLATFORM",
                orderId: order.id,
                user: { connect: { id: userId } },
                subscription: subscription?.id ? { connect: { id: subscription.id } } : undefined,
            }
        })
    
        return jsonResponse({
            userId: userId,
            userEmail: userEmail,
            userName: session.user.name || "Guest",
            orderId: order.id,
            amount, 
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            created_at: order.created_at,
        }, { message: "Order created successfully", success: true, status: 200 });
    } catch (error) {
        console.error("Error creating order:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}