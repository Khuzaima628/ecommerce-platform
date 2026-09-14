# Stripe Payments — Full Guide

**Jump to:**
[1. Setup](#1-setup) ·
[2. The Stripe client](#2-the-stripe-client) ·
[3. Turning a cart into an order](#3-turning-a-cart-into-an-order) ·
[4. Sending the customer to pay](#4-sending-the-customer-to-pay) ·
[5. Idempotency](#5-idempotency--the-double-click-problem) ·
[6. The webhook](#6-the-webhook--hearing-back-from-stripe) ·
[7. Marking the order paid](#7-marking-the-order-paid) ·
[8. Local testing with the CLI](#8-local-testing-with-the-cli) ·
[9. Errors](#9-errors-and-what-they-really-mean)

---

## 1. Setup

### Install

```bash
npm install stripe
```

### Get your keys

Two keys, from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys):

| Key | Starts with | Used where |
|---|---|---|
| Publishable key | `pk_test_...` | frontend only |
| **Secret key** | `sk_test_...` | **backend only**, never shown to a browser |

### `.env`

```
# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

`STRIPE_WEBHOOK_SECRET` comes later, from `stripe listen` — see
[§8](#8-local-testing-with-the-cli). Put a blank placeholder for both in
`.env.example` (never a real value there — that file is committed to git).

⚠️ **Never paste a real key anywhere outside `.env`** — not in chat, not in
a commit, not in a screenshot. Treat it like a password.

---

## 2. The Stripe client

**File:** [`src/config/stripe.ts`](../src/config/stripe.ts)

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

Same pattern as [`src/config/s3.ts`](../src/config/s3.ts) — one client, made
once, imported everywhere else that needs to talk to Stripe. Everything
after this section just calls methods on this `stripe` object.

---

## 3. Turning a cart into an order

**File:** [`src/services/orderService.ts`](../src/services/orderService.ts) — `createOrderService`

This part has **nothing Stripe-specific in it yet** — no payment has
happened. It only:

1. Reads the cart (`cartProductModel.find({ userId })`)
2. Checks each item has enough stock
3. **Snapshots** each product's name and price into the order (so a later
   price change never rewrites an old order — see the comment on
   `orderItemSchema` in [`orderModel.ts`](../src/models/orderModel.ts))
4. Reduces stock, clears the cart
5. Saves the order with `status: "pending"`, `paymentStatus: "unpaid"`
   (the defaults from the schema)

```ts
const order = await orderModel.create({ userId, items, totalAmount });

await Promise.all(
  items.map((item) =>
    productModel.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    }),
  ),
);

await cartProductModel.deleteMany({ userId });
```

> In this project, stock is reserved **at order time**, not after payment.
> That is a deliberate, simpler choice — the alternative (only reserving
> stock once the webhook confirms payment) is more correct for a busy real
> store, but adds more moving parts. Worth knowing as a tradeoff, not a bug.

At this point, the order exists — but nobody has paid yet.

---

## 4. Sending the customer to pay

**File:** [`src/services/orderService.ts`](../src/services/orderService.ts) — `createCheckoutSessionService`

```ts
export const createCheckoutSessionService = async (userId: string, oid: string) => {
  const order = await getOrderByIdService(userId, oid);

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      managed_payments: { enabled: false },
      line_items: order.items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.productName },
          unit_amount: item.price * 100, // Stripe wants cents, not dollars
        },
        quantity: item.quantity,
      })),
      success_url: "http://localhost:5000/api/v1/order/success",
      cancel_url: "http://localhost:5000/api/v1/order/cancel",
    },
    { idempotencyKey: `checkout-${order._id.toString()}` },
  );

  order.stripeSessionId = session.id;
  await order.save();

  return session.url;
};
```

| Field | Meaning |
|---|---|
| `mode: "payment"` | one-time payment, not a subscription |
| `managed_payments: { enabled: false }` | Stripe's Managed Payments only supports **digital** goods — we sell physical products, so this must stay off, or session creation fails with a tax-code error |
| `price_data` | build the price **on the fly**, from data we already have, instead of pre-registering a Stripe "Product" for every item |
| `unit_amount` | **cents**, not dollars — `2600` here means $26.00 |
| `success_url` / `cancel_url` | where the browser redirects after Checkout — currently placeholders pointing at the backend; a real frontend page would replace these |

`session.url` is the actual link — send the customer there (in a real app,
your frontend redirects the browser to it; for testing, you paste it into a
browser tab yourself).

Saving `order.stripeSessionId = session.id` here is what makes
[§7](#7-marking-the-order-paid) possible later — it is the one value both
your database and Stripe agree on.

---

## 5. Idempotency — the double-click problem

The second argument to `sessions.create`:

```ts
{ idempotencyKey: `checkout-${order._id.toString()}` }
```

If the customer double-clicks "Checkout," or a retry happens, this call
runs twice for the **same** order. Without an idempotency key, that would
create **two different** Stripe sessions for one order — and the second
`session.id` would silently overwrite the first in your database.

The key is built from the order's own `_id`, so it is always the same for
that order. Stripe remembers the result of the *first* call for 24 hours;
any repeat request with the same key gets that same original session back
instead of creating a new one.

> Known, accepted gap: if `order.save()` fails right after
> `stripe.checkout.sessions.create()` succeeds, Stripe has a live session
> your database doesn't know about yet. This is an **atomicity** gap
> between two separate systems (Stripe's servers, your MongoDB) — there is
> no transaction that spans both. In practice the webhook in §6 still finds
> the payment via Stripe's own records even if this specific save failed,
> so it is a known, low-priority gap rather than a blocking one.

---

## 6. The webhook — hearing back from Stripe

This is the part that runs **after** the customer actually pays. Full
detail already written in a dedicated file below — read that one first,
then come back here for how it fits into the order lifecycle.

📄 **Full breakdown, line by line:** [`docs/stripeWebhookGuide.md`](stripeWebhookGuide.md)

The short version:

```
1. Customer pays on Stripe's page
2. Stripe's server → POST → /api/v1/webhook/stripe
3. Signature is verified (constructEvent)
4. event.type === "checkout.session.completed" → we know payment succeeded
5. markOrderAsPaidService(session.id) runs — see §7
6. Server responds 200 → Stripe stops retrying
```

**Files involved:**

| File | Job |
|---|---|
| [`src/app.ts`](../src/app.ts) | mounts the webhook route **before** `express.json()` so the raw body survives |
| [`src/routes/webhookRoutes.ts`](../src/routes/webhookRoutes.ts) | the route, using `express.raw()` |
| [`src/controllers/webhookController.ts`](../src/controllers/webhookController.ts) | verifies the signature, reads `event.type`, calls the service |

---

## 7. Marking the order paid

**File:** [`src/services/orderService.ts`](../src/services/orderService.ts) — `markOrderAsPaidService`

```ts
export const markOrderAsPaidService = async (sessionId: string) => {
  const order = await orderModel.findOne({ stripeSessionId: sessionId });

  if (!order) {
    console.error("No order found for Stripe session:", sessionId);
    return null;
  }

  order.status = "paid";
  order.paymentStatus = "paid";
  await order.save();

  return order;
};
```

This is the "change status" step. Two fields on the **order** flip —
`status` and `paymentStatus` — both defined in
[`orderModel.ts`](../src/models/orderModel.ts):

```ts
status: {
  type: String,
  enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
  default: "pending",
},
paymentStatus: {
  type: String,
  enum: ["unpaid", "paid"],
  default: "unpaid",
},
```

> **Note:** there is no separate `status` field on `productModel.ts` — a
> product doesn't have a "paid" state, only the order does. Stock changes
> on the product (`$inc: { stock: -item.quantity }`) already happened
> earlier, at order-creation time in §3 — payment success does not touch
> product stock again.

The lookup uses `stripeSessionId`, matching the value saved in §4. This is
the entire reason that field exists — it is the bridge between "a Stripe
event just arrived" and "which of my orders does this belong to."

### Why this function returns `null` instead of throwing

Every other service in this project throws `AppError` on a missing record.
This one doesn't — its caller is Stripe's own retry system, not a person
waiting on a screen. Throwing here would make the controller respond with
something other than `200`, and Stripe would **retry the same event
forever**. Logging and returning quietly is correct here specifically.

### Making a second delivery of the same event harmless

Stripe **can** deliver the same webhook event more than once (network
retries, etc). Setting `"paid"` to `"paid"` again causes no harm today —
but if logic is ever added here later (sending a confirmation email,
awarding points), guard it:

```ts
if (order.paymentStatus === "paid") {
  return order; // already processed, do nothing more
}
```

Not added yet, since nothing in this function currently repeats unsafely —
worth adding the moment something does.

---

## 8. Local testing with the CLI

Stripe's servers can't reach `localhost` — this tunnel is dev-only.

```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/webhook/stripe
```

`stripe login` connects the CLI to your account (once). `stripe listen`
relays real events down to your local server and prints the
`STRIPE_WEBHOOK_SECRET` you need — keep it running in its own terminal the
whole time you're testing.

```bash
stripe events list --limit 5     # see recent events on your account
stripe events resend <event_id>  # re-deliver one event again, no new payment needed
```

⚠️ **Match the account.** Run `stripe config --list` and compare its
`account_id` against the account prefix embedded in your `.env`'s
`sk_test_...` key. If they don't match, `stripe login --new-session` and
pick the correct environment ("Test mode," not "Testing sandbox," unless
your key says otherwise) — a mismatched account means events never reach
your listener at all.

Full detail on `stripe listen`/`login`/tunneling:
[`stripeWebhookGuide.md §9`](stripeWebhookGuide.md#9-local-dev-only--the-cli-tunnel).

---

## 9. Errors and what they really mean

| Error | Real reason | Where it's handled |
|---|---|---|
| "product tax code is missing" | Managed Payments only supports digital goods | `managed_payments: { enabled: false }` in §4 |
| `SignatureDoesNotMatch` / signature verification failed | wrong secret, or body already parsed by `express.json()` first | §6 — middleware order in `app.ts` |
| "This link is incomplete" (Stripe Checkout page) | the URL got truncated somewhere in copy/paste, or the session expired | copy the full `url` straight from the API response, don't retype it |
| Order stays `pending` after real payment | check: is `stripe listen` running? does the controller actually call `markOrderAsPaidService`, not just log? | §7 |
| `pending_webhooks: 0` on `stripe events list` | no listener was connected at the moment the event fired | §8 |
| Idempotency key returns an old/expired session | that order already has a cached session from an earlier attempt | create a fresh order, or wait past the 24h idempotency window |

---

## Words to search when you read the real docs

```
Stripe checkout session create
Stripe managed payments
Stripe idempotent requests
Stripe webhook signature verification
Stripe CLI listen
```

- <https://docs.stripe.com/checkout/quickstart>
- <https://docs.stripe.com/api/idempotent_requests>
- <https://docs.stripe.com/webhooks/quickstart>
- <https://docs.stripe.com/payments/managed-payments/eligibility>
