import type { Request, Response } from "express";
import { stripe } from "@src/config/stripe";
import catchAsync from "@src/utils/catchAsync";
import AppError from "@src/utils/appError";
import { markOrderAsPaidService } from "@src/services/orderService";

export const stripeWebhookController = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["stripe-signature"] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      throw new AppError(400, "Webhook signature verification failed");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string };
      await markOrderAsPaidService(session.id);
    }

    res.status(200).json({ received: true });
  },
);
