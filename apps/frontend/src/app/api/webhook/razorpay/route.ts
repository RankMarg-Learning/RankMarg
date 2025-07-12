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
        return jsonResponse(null, { message: "Invalid signature", status: 400, success: false })
    }

    const event = JSON.parse(rawBody);

    switch (event.event) {
        case 'payment.captured':
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            if (orderId) {
                const subscription = await prisma.subscription.findFirst({
                    where: { providerId: orderId },
                });

                if (subscription) {
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: { status: 'ACTIVE' },
                    });

                    await prisma.payment.create({
                        data: {
                            userId: payment.notes?.userId || subscription.userId,
                            subscriptionId: subscription.id,
                            amount: payment.amount / 100,
                            currency: payment.currency,
                            status: 'COMPLETED',
                            provider: 'PLATFORM',
                            paymentMethod: payment.method,
                            orderId: orderId,
                            paidAt: new Date(),
                        },
                    });
                }
            }
            break;

        case 'payment.failed':
            const failedPayment = event.payload.payment.entity;
            const failedOrderId = failedPayment.order_id;

            if (failedOrderId) {
                const subscription = await prisma.subscription.findFirst({
                    where: { providerId: failedOrderId },
                });

                if (subscription) {
                    await prisma.payment.update({
                        where: { id: subscription.id },
                        data: { status: 'FAILED' },
                    });

                    await prisma.payment.create({
                        data: {
                            userId: failedPayment.notes?.userId || subscription.userId,
                            subscriptionId: subscription.id,
                            amount: failedPayment.amount / 100,
                            currency: failedPayment.currency,
                            status: 'FAILED',
                            paymentMethod: failedPayment.method,
                            provider: 'PLATFORM',
                            orderId: failedOrderId,
                            paidAt: new Date(),
                        },
                    });
                }
            }
            break;

        default:
            console.log(`Unhandled event: ${event.event}`);
    }
}