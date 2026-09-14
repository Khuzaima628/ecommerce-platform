# Stripe Webhook — Easy Guide

## 1. The one idea to understand first

Normally, YOUR app calls Stripe:

```ts
const session = await stripe.checkout.sessions.create({ ... });
```

A webhook is the **opposite direction** — Stripe calls YOU:

```
Customer pays  →  Stripe's servers process it  →  Stripe's servers
                                                    POST your server
```

Nobody in the browser is involved in that last arrow. It is one server
(Stripe's) calling another server (yours) — the same shape as any API call,
just automatic and from their side.

| | Checkout session | Webhook |
|---|---|---|
| Who calls who | you → Stripe | Stripe → you |
| Why | "make me a payment page" | "here's what happened" |
| Your file | `orderService.ts` | `webhookController.ts` |

---

## 2. The route — `express.raw()`, not `express.json()`

**File:** [`src/routes/webhookRoutes.ts`](../src/routes/webhookRoutes.ts)

```ts
webhookRouter.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController,
);
```

Every other route in this project uses `express.json()`, which turns the
request body into a normal JS object (`req.body.name`, etc.). This route
does **not** use that.

**Why:** Stripe signs the **exact bytes** it sends. If Express changes those
bytes in any way — even reformatting the same JSON — the signature no
longer matches. `express.raw()` keeps the body as raw, untouched bytes
(a `Buffer`), exactly as Stripe sent it.

```ts
express.raw({ type: "application/json" })
//              ↑ only apply this to requests whose Content-Type
//                is application/json — Stripe's webhook requests are
```

> **Analogy:** `express.json()` is like a translator who reads a letter and
> retypes it for you — convenient, but the original handwriting is gone.
> `express.raw()` keeps the original letter, unopened, exactly as it
> arrived. Stripe needs to check the original envelope's seal (signature),
> not a retyped copy.

### Why this had to move in `app.ts`

**File:** [`src/app.ts`](../src/app.ts)

```ts
app.use(morgan("dev"));

// webhook mounted here — BEFORE applySecurity()
app.use("/api/v1", webhookRoute);

applySecurity(app);   // this runs express.json() globally
Routes(app);
```

`applySecurity()` runs `express.json()` for **every** route, with no
exceptions, and it used to run *before* the webhook route existed. By the
time the webhook route's own `express.raw()` ran, `express.json()` had
already eaten the body and turned it into an object — nothing raw was left.

**Express runs middleware in the order you `app.use()` them.** So the fix is
just: register the webhook route earlier, before `express.json()` exists.
First come, first served.

---

## 3. The signature — proving the request really came from Stripe

**File:** [`src/controllers/webhookController.ts`](../src/controllers/webhookController.ts)

```ts
const signature = req.headers["stripe-signature"] as string;
```

Every request Stripe sends carries one extra header:

```
Stripe-Signature: t=1699999999,v1=5257a869e7ecebeda32affa62cdca3fa...
```

This is **not** your webhook secret. It is a signature Stripe computed —
math done on the request body **using** your webhook secret as the key —
proving "only someone who knows the secret could have made this exact
signature for this exact body."

| | Simple meaning |
|---|---|
| Body | the letter |
| `STRIPE_WEBHOOK_SECRET` | a stamp only you and Stripe know |
| `stripe-signature` header | the wax seal made with that stamp |

Anyone can *send* a POST request to your `/webhook/stripe` URL — it is a
public address. The signature is what proves the request is real and not
someone pretending to be Stripe.

---

## 4. `constructEvent` — check the seal, then open the letter

```ts
let event;
try {
  event = stripe.webhooks.constructEvent(
    req.body,                          // 1. the raw bytes
    signature,                         // 2. the header we just read
    process.env.STRIPE_WEBHOOK_SECRET!, // 3. your secret
  );
} catch (err) {
  throw new AppError(400, "Webhook signature verification failed");
}
```

`constructEvent` does two jobs in one call:

1. **Checks the signature.** It recomputes what the signature *should* be,
   using your secret and the raw body, and compares it to the
   `stripe-signature` header. If they don't match → it **throws**.
2. **If they match**, it turns the raw bytes into a normal JS object you can
   read — the `event`.

```ts
const example = stripe.webhooks.constructEvent(rawBytes, header, secret);
// example.type === "checkout.session.completed"
// example.data.object.id === "cs_test_..."
```

> **Why the `try/catch`:** if verification fails, we must **not** trust
> anything inside the body — it might be from an attacker, not Stripe. We
> throw a `400` and stop immediately, before touching the database.

---

## 5. `event.type` — which thing happened

Stripe sends this same endpoint **many** different kinds of events over
time — a payment succeeded, a refund happened, a dispute opened, and more.
`event.type` tells you which one this is.

```ts
if (event.type === "checkout.session.completed") {
  const session = event.data.object as { id: string };
  await markOrderAsPaidService(session.id);
}
```

We only care about **one** type right now: `checkout.session.completed`,
which means *"the customer finished paying on Stripe's page."* Any other
type is simply ignored — we don't throw an error for those, since receiving
event types we don't handle yet is completely normal, not a bug.

`event.data.object` is the actual thing that changed — here, the
[Checkout Session](https://docs.stripe.com/api/checkout/sessions/object)
that was completed. We only need **one field** out of the huge object it
carries: `.id` — the same `cs_test_...` id we saved earlier in
`order.stripeSessionId`.

---

## 6. Finding the order — matching Stripe's id to yours

**File:** [`src/services/orderService.ts`](../src/services/orderService.ts)

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

This is why we saved `stripeSessionId` on the order **before** sending the
customer to pay, back in `createCheckoutSessionService`:

```ts
order.stripeSessionId = session.id;
await order.save();
```

Two different moments, same value, used to reconnect them:

```
1. You create the session → save session.id on the order
2. Stripe sends the webhook → look up the order BY that same session.id
```

### Why `return null` instead of `throw`

Every other service in this project throws `AppError` when something isn't
found — but not here. The "caller" of this function is **Stripe's retry
system**, not a person waiting on a screen. If we throw and the controller
sends back anything other than `200`, Stripe assumes delivery failed and
will **retry the same event again later**. So webhook handlers log the
problem and quietly move on instead.

---

## 7. Responding `200` — telling Stripe "got it"

```ts
res.status(200).json({ received: true });
```

The **last** thing the controller does. Stripe watches for this response —
if it doesn't arrive quickly, or arrives with an error status, Stripe
assumes something went wrong and retries the whole event later. Sending
`200` early and fast is a real rule, not just good style: don't put slow
work (like sending an email) directly inside this handler — do the fast
part here, and if you need slow work later, queue it separately.

---

## 8. The whole path, in order

```
1. Customer pays on Stripe's page
2. Stripe's server → POST → localhost:5000/api/v1/webhook/stripe
3. app.ts: webhook route already mounted, so express.raw() gets the
   raw body — express.json() never touches this one route
4. Controller reads req.headers["stripe-signature"]
5. constructEvent(rawBody, signature, secret) verifies + decodes it
   → throws 400 if it fails, stops here
6. event.type === "checkout.session.completed" → true
7. markOrderAsPaidService(event.data.object.id) runs
8. It finds the order by stripeSessionId, sets both fields to "paid"
9. res.status(200) → Stripe marks this event as delivered, stops retrying
```

---

## 9. Local dev only — the CLI tunnel

**Why you need this only on your laptop:** Stripe's servers can't reach
`localhost:5000` — that address only exists on your machine. In real
production, you'd register your public domain once in the Stripe Dashboard
and skip this step entirely.

```bash
stripe login
stripe listen --forward-to localhost:5000/api/v1/webhook/stripe
```

| Command | Job |
|---|---|
| `stripe login` | connects the CLI to your Stripe account (one time) |
| `stripe listen --forward-to ...` | relays real Stripe events down to your local server |

```
Stripe's real servers → Stripe CLI (tunnel) → localhost:5000/...
```

`stripe listen` prints a `whsec_...` value — that is your
`STRIPE_WEBHOOK_SECRET`. It must stay running, in its own terminal, the
whole time you're testing — closing it closes the tunnel.

### Useful CLI commands while testing

```bash
stripe events list --limit 5     # see recent events on your account
stripe events resend <event_id>  # re-send one event to your webhook again
```

`resend` is what we used to test this whole flow without paying again and
again — it takes an event that already happened and delivers it to your
listener a second time.

---

## 10. Errors and what they really mean

| Error | Real reason |
|---|---|
| `Webhook signature verification failed` | wrong `STRIPE_WEBHOOK_SECRET`, or the body was already parsed by `express.json()` before it reached this route |
| Order stays `pending` after a real payment | check: is `stripe listen` actually running? does `event.type` handling actually call `markOrderAsPaidService`, or just `console.log`? |
| `pending_webhooks: 0` on `stripe events list` | no listener was connected when the event fired — `stripe listen` wasn't running at that moment |
| CLI account doesn't match your `.env` key | run `stripe config --list` and compare the `account_id` against the account prefix in your `sk_test_...` key |

---

## 11. Words to search when you read the real docs

```
Stripe webhook signature verification
Stripe constructEvent
Stripe CLI listen
Stripe event types
Stripe webhook idempotency
```

Official pages:

- <https://docs.stripe.com/webhooks/quickstart>
- <https://docs.stripe.com/api/events/types>
- <https://docs.stripe.com/webhooks/signatures>
