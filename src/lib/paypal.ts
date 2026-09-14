// Plain REST calls against PayPal's Orders v2 API rather than an SDK
// dependency — this is the same server-to-server integration the official
// SDKs wrap, without pulling in another fast-moving vendor package. The
// buyer approves payment on PayPal's own hosted page, so card/bank details
// never touch this server.
import { getStoreSettings } from "@/lib/store-settings";

const PAYPAL_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Checks the DB (Admin > Settings > Payments) first, falling back to env
// vars of the same name — either configuration path works.
async function getPaypalCredentials() {
  const settings = await getStoreSettings();
  return {
    clientId: settings.paypalClientId || process.env.PAYPAL_CLIENT_ID || null,
    clientSecret: settings.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET || null,
    webhookId: settings.paypalWebhookId || process.env.PAYPAL_WEBHOOK_ID || null,
  };
}

export async function isPaypalConfigured() {
  const { clientId, clientSecret } = await getPaypalCredentials();
  return Boolean(clientId && clientSecret);
}

let cachedToken: { clientId: string; value: string; expiresAt: number } | null = null;

async function getAccessToken() {
  const { clientId, clientSecret } = await getPaypalCredentials();
  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal is not configured — add credentials in Admin > Settings > Payments, or set PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET."
    );
  }

  // Keyed on clientId so changing credentials in the admin UI doesn't keep
  // using a token minted under the old ones.
  if (cachedToken && cachedToken.clientId === clientId && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Failed to authenticate with PayPal");

  const data = await res.json();
  cachedToken = {
    clientId,
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export async function createPaypalOrder(input: {
  orderNumber: string;
  amountCents: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.orderNumber,
          amount: {
            currency_code: input.currency,
            value: (input.amountCents / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        user_action: "PAY_NOW",
      },
    }),
  });
  if (!res.ok) throw new Error(`PayPal order creation failed: ${await res.text()}`);

  const data = await res.json();
  const approveUrl = data.links?.find(
    (link: { rel: string; href: string }) => link.rel === "approve"
  )?.href;
  if (!approveUrl) throw new Error("PayPal did not return an approval link");

  return { id: data.id as string, approveUrl: approveUrl as string };
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`PayPal capture failed: ${await res.text()}`);
  return res.json() as Promise<{ status: string }>;
}

// Verifies the webhook actually came from PayPal — never trust an
// unauthenticated POST claiming a payment succeeded.
export async function verifyPaypalWebhookSignature(headers: Headers, rawBody: string) {
  const { webhookId } = await getPaypalCredentials();
  if (!webhookId) throw new Error("PayPal webhook ID is not configured");

  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_time: headers.get("paypal-transmission-time"),
      cert_url: headers.get("paypal-cert-url"),
      auth_algo: headers.get("paypal-auth-algo"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  if (!res.ok) return false;

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
