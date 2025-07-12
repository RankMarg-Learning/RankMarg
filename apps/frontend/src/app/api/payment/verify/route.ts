
import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import crypto from 'crypto';


export async function POST(request: Request) {
  try {
    const { coupon,discount,planId,duration,amount,userId,orderId, razorpayPaymentId, razorpaySignature } = await request.json();

    const text = `${orderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return jsonResponse(null,{ message: 'Invalid signature' ,status: 400, success: false });
    }

   const subscription =  await prisma.subscription.update({
        where:{
            userId
        },
        data:{
            planId: planId,
            duration:duration,
            status: 'ACTIVE',
            provider: 'PLATFORM',
            amount: amount,
            discountApplied: discount || 0,
            promoCodeUsed: coupon || null,
            currentPeriodEnd: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), 
            trialEndsAt: null,
        }
        ,
        select:{
          currentPeriodEnd: true,
          plan:{
            select:{
                name:true,
                id:true,
            }
          }
        }
    })


    return jsonResponse({expiry:subscription.currentPeriodEnd.toLocaleDateString('en-IN'),planId:subscription.plan.id,planName:subscription.plan.name},{ message: 'Payment verified successfully', success: true , status: 200 });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return jsonResponse(null, { message: 'Internal server error', success: false, status: 500 });
  } 
}