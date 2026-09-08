// What the frontend sends to cancel an order — nothing extra needed,
// the order id comes from the URL and the user id comes from the token.
export type cancelOrderBody = Record<string, never>;
