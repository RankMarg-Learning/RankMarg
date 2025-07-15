import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import crypto from 'crypto';

export async function POST(req: Request) {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(rawBody.toString())
        .digest('hex');

    if (signature !== expectedSignature) {
        return jsonResponse(null, { message: "Invalid signature", status: 400, success: false });
    }

    try {
        const event = JSON.parse(rawBody);

        switch (event.event) {
            case 'payment.captured':
                const payment = event.payload.payment.entity;
                const orderId = payment.order_id;

                if (orderId) {
                    await prisma.payment.updateMany({
                        where: { orderId: orderId },
                        data: {
                            status: 'COMPLETED',
                            paymentMethod: payment.method,
                            paidAt: new Date(),
                        },
                    });

                    if(payment.notes?.userId) {
                        await prisma.subscription.updateMany({
                            where: { userId: payment.notes.userId },
                            data: {
                                status: 'ACTIVE',
                                planId: payment.notes.planId,
                            }
                        });
                    }
                }
                break;

            case 'payment.failed':
                const failedPayment = event.payload.payment.entity;
                const failedOrderId = failedPayment.order_id;

                if (failedOrderId) {
                    await prisma.payment.updateMany({
                        where: { orderId: failedOrderId },
                        data: {
                            status: 'FAILED',
                            paymentMethod: failedPayment.method,
                        },
                    });

                    if (failedPayment.notes?.userId) {
                        await prisma.subscription.updateMany({
                            where: { userId: failedPayment.notes.userId },
                            data: {
                                status: 'CANCELLED'
                            }
                        });
                    }
                }
                break;

            default:
                console.log(`Unhandled event: ${event.event}`);
        }

        return jsonResponse(null, { message: "Webhook processed successfully", status: 200, success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return jsonResponse(null, { message: "Webhook processing failed", status: 500, success: false });
    }
}