import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "react-email";

export type OrderStatus =
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUS_COPY: Record<OrderStatus, { heading: string; message: string }> = {
  paid: {
    heading: "Payment received",
    message: "We've received your payment and your order is now being prepared.",
  },
  processing: {
    heading: "Order being prepared",
    message: "Your order is being processed.",
  },
  shipped: {
    heading: "Your order is on its way",
    message: "Your order has shipped.",
  },
  delivered: {
    heading: "Order delivered",
    message: "Your order has been delivered. Enjoy!",
  },
  cancelled: {
    heading: "Order cancelled",
    message: "Your order has been cancelled.",
  },
  refunded: {
    heading: "Order refunded",
    message: "Your order has been refunded.",
  },
};

interface OrderStatusEmailProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  orderNumber: string;
  status: OrderStatus;
  trackingNumber: string | null;
  orderUrl: string;
}

export default function OrderStatusEmail({
  storeName,
  logoUrl,
  primaryColor,
  orderNumber,
  status,
  trackingNumber,
  orderUrl,
}: OrderStatusEmailProps) {
  const copy = STATUS_COPY[status];

  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset], theme: { extend: { colors: { brand: primaryColor } } } }}>
        <Head />
        <Preview>
          Order {orderNumber}: {copy.heading}
        </Preview>
        <Body className="bg-[#f4f1ec] font-sans">
          <Container className="mx-auto max-w-[480px] px-6 py-10">
            <Section className="rounded-lg bg-white px-8 py-10 text-center shadow-sm">
              {logoUrl ? (
                <Section className="mb-4 text-center">
                  <img
                    src={logoUrl}
                    width="40"
                    height="40"
                    alt={storeName}
                    style={{ margin: "0 auto", borderRadius: 8 }}
                  />
                </Section>
              ) : null}
              <Heading as="h1" className="m-0 text-xl font-semibold text-[#1f1c18]">
                {copy.heading}
              </Heading>
              <Text className="mt-4 text-sm leading-6 text-[#4a453d]">{copy.message}</Text>
              <Section className="mt-6 rounded-md bg-[#f7f4ee] px-4 py-3">
                <Text className="m-0 text-xs tracking-wide text-[#a39c8d] uppercase">
                  Order number
                </Text>
                <Text className="m-0 text-sm font-medium text-[#1f1c18]">{orderNumber}</Text>
                {trackingNumber ? (
                  <>
                    <Text className="mt-3 mb-0 text-xs tracking-wide text-[#a39c8d] uppercase">
                      Tracking number
                    </Text>
                    <Text className="m-0 text-sm font-medium text-[#1f1c18]">
                      {trackingNumber}
                    </Text>
                  </>
                ) : null}
              </Section>
              <Button
                href={orderUrl}
                className="box-border mt-6 rounded-md bg-brand px-6 py-3 text-sm font-medium text-white no-underline"
              >
                View your order
              </Button>
              <Hr className="my-6 border-solid border-[#ece7dd]" />
              <Text className="m-0 text-xs text-[#a39c8d]">
                Questions about this order? Just reply to this email.
              </Text>
            </Section>
            <Text className="mt-6 text-center text-xs text-[#a39c8d]">
              {storeName} — authentic Venetian glass, handmade in Murano.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

OrderStatusEmail.PreviewProps = {
  storeName: "Perla Murano Glass",
  logoUrl: null,
  primaryColor: "#0f6e5e",
  orderNumber: "ORD-20260917-AB12CD34",
  status: "shipped",
  trackingNumber: "IT123456789IT",
  orderUrl: "https://perlamuranoglass.com/order-confirmation/ORD-20260917-AB12CD34",
} satisfies OrderStatusEmailProps;

export { OrderStatusEmail };
