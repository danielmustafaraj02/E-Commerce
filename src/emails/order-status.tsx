import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Img,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "react-email";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { localeDir, type Locale } from "@/lib/i18n/locale-constants";

export type OrderStatus =
  "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface OrderStatusEmailItem {
  name: string;
  quantity: number;
  unitPrice: number; // cents
  imageUrl: string | null;
}

interface OrderStatusEmailProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  orderNumber: string;
  orderDate: string; // pre-formatted
  status: OrderStatus;
  trackingNumber: string | null;
  orderUrl: string;
  items: OrderStatusEmailItem[];
  currency: string;
  locale: string;
  total: number; // cents
  companyLegalName: string | null;
  companyAddress: string | null;
  vatNumber: string | null;
  t: Dictionary["emails"];
  lang: Locale; // the email's language (`locale` above is only for formatting numbers)
}

function money(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}

export default function OrderStatusEmail({
  storeName,
  logoUrl,
  primaryColor,
  orderNumber,
  orderDate,
  status,
  trackingNumber,
  orderUrl,
  items,
  currency,
  locale,
  total,
  companyLegalName,
  companyAddress,
  vatNumber,
  t,
  lang,
}: OrderStatusEmailProps) {
  const copy = t.status[status];

  return (
    <Html lang={lang} dir={localeDir(lang)}>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: { colors: { brand: primaryColor } } },
        }}
      >
        <Head />
        <Preview>{applyTemplate(t.orderSubject, { orderNumber, heading: copy.heading })}</Preview>
        <Body className="bg-[#f4f1ec] font-sans">
          <Container className="mx-auto max-w-[560px] px-6 py-10">
            <Section className="mb-6 text-center">
              {logoUrl ? (
                <Img
                  src={logoUrl}
                  width="40"
                  height="40"
                  alt={storeName}
                  style={{ margin: "0 auto", borderRadius: 8 }}
                />
              ) : null}
              <Text className="mt-2 mb-0 text-xs tracking-[0.2em] text-[#a39c8d] uppercase">
                {storeName}
              </Text>
            </Section>

            <Section className="rounded-xl bg-white px-8 py-10 text-center shadow-sm">
              <Heading as="h1" className="m-0 text-xl font-semibold text-[#1f1c18]">
                {copy.heading}
              </Heading>
              <Text className="mt-3 text-sm leading-6 text-[#4a453d]">{copy.message}</Text>

              <Section className="mt-6 rounded-md bg-[#f7f4ee] px-4 py-3 text-left">
                <Row>
                  <Column>
                    <Text className="m-0 text-xs tracking-wide text-[#a39c8d] uppercase">
                      {t.orderNumberLabel}
                    </Text>
                    <Text className="m-0 text-sm font-medium text-[#1f1c18]">{orderNumber}</Text>
                  </Column>
                  <Column>
                    <Text className="m-0 text-xs tracking-wide text-[#a39c8d] uppercase">
                      {t.orderDateLabel}
                    </Text>
                    <Text className="m-0 text-sm font-medium text-[#1f1c18]">{orderDate}</Text>
                  </Column>
                </Row>
                {trackingNumber ? (
                  <Row className="mt-3">
                    <Column>
                      <Text className="m-0 text-xs tracking-wide text-[#a39c8d] uppercase">
                        {t.trackingLabel}
                      </Text>
                      <Text className="m-0 text-sm font-medium text-[#1f1c18]">
                        {trackingNumber}
                      </Text>
                    </Column>
                  </Row>
                ) : null}
              </Section>

              {items.length > 0 && (
                <Section className="mt-6 text-left">
                  {items.map((item, index) => (
                    <Row key={index} className="mb-3">
                      <Column className="w-16 align-top">
                        {item.imageUrl ? (
                          <Img
                            src={item.imageUrl}
                            width="56"
                            height="56"
                            alt={item.name}
                            style={{ borderRadius: 8, objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 8,
                              backgroundColor: "#f0ece3",
                            }}
                          />
                        )}
                      </Column>
                      <Column className="pl-3 align-top">
                        <Text className="m-0 text-sm text-[#1f1c18]">
                          {item.name} &times; {item.quantity}
                        </Text>
                      </Column>
                      <Column className="w-20 text-right align-top">
                        <Text className="m-0 text-sm font-medium text-[#1f1c18]">
                          {money(item.unitPrice * item.quantity, currency, locale)}
                        </Text>
                      </Column>
                    </Row>
                  ))}
                  <Hr className="my-3 border-solid border-[#ece7dd]" />
                  <Row>
                    <Column>
                      <Text className="m-0 text-sm font-semibold text-[#1f1c18]">
                        {t.totalLabel}
                      </Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="m-0 text-sm font-semibold text-[#1f1c18]">
                        {money(total, currency, locale)}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              )}

              <Button
                href={orderUrl}
                className="bg-brand mt-8 box-border rounded-md px-6 py-3 text-sm font-medium text-white no-underline"
              >
                {t.viewOrder}
              </Button>

              <Hr className="my-6 border-solid border-[#ece7dd]" />
              <Text className="m-0 text-xs text-[#a39c8d]">{t.orderQuestions}</Text>
            </Section>

            <Section className="mt-6 text-center text-xs text-[#a39c8d]">
              <Text className="m-0">{applyTemplate(t.tagline, { storeName })}</Text>
              {companyLegalName ? (
                <Text className="m-0 mt-2">
                  {companyLegalName}
                  {companyAddress ? ` · ${companyAddress}` : ""}
                  {vatNumber ? ` · ${applyTemplate(t.vatLabel, { number: vatNumber })}` : ""}
                </Text>
              ) : null}
            </Section>
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
  orderDate: "17 September 2026",
  status: "shipped",
  trackingNumber: "IT123456789IT",
  orderUrl: "https://perlamuranoglass.com/it/order-confirmation/ORD-20260917-AB12CD34",
  items: [
    {
      name: "Orecchini Sassolino di Onice",
      quantity: 1,
      unitPrice: 4500,
      imageUrl: "https://perlamuranoglass.com/placeholder.jpg",
    },
  ],
  currency: "EUR",
  locale: "en-US",
  total: 4500,
  companyLegalName: "Perla Murano Glass S.r.l.",
  companyAddress: "Murano, Venezia, Italia",
  vatNumber: "IT00000000000",
  t: getDictionary("en").emails,
  lang: "en",
} satisfies OrderStatusEmailProps;

export { OrderStatusEmail };
