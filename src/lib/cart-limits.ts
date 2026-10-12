/**
 * How much one cart may hold. The cart and product pages offer at most
 * MAX_CART_QUANTITY of a piece, and checkout enforces the same limits on the
 * server, so a hand-made request can't make checkout do unbounded work or hold
 * unbounded stock (security audit F04). No client code imports more than this.
 */
export const MAX_CART_QUANTITY = 10;

/** Different pieces in one order. */
export const MAX_CART_LINES = 50;
