export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req:Request) {
    try {
        const url = new URL(req.url);
        const coupon = url.searchParams.get("coupon");
        const planId = url.searchParams.get("planId");

        if (!coupon) {
            return jsonResponse(null, { message: 'Coupon code is required', success: false, status: 400 });
        }
        if (!planId) {
            return jsonResponse(null, { message: 'Plan ID is required', success: false, status: 400 });
        }
        const cpn = await prisma.promoCode.findFirst({
            where: {
                code: coupon,
                isActive: true,
                validUntil: {
                    gte: new Date(),
                },
                applicablePlans:{
                    some: {
                        id: planId,  
                    },
                }
            },
            select:{
                id:true,
                code:true,
                discount:true,
            }
        });
        if (!cpn) {
            return jsonResponse(null, { message: 'Invalid or expired coupon code', success: false, status: 400 });
        }
        return jsonResponse(cpn, { message: 'Coupon code is valid', success: true, status: 200 });
        
    } catch (error) {
        console.error('Error in GET /api/check/coupon:', error);
        return jsonResponse (null, { message: 'Internal server error', success: false, status: 500 });
    }
}