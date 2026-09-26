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
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { applyTemplate } from "@/lib/i18n/format";
import { localeDir, type Locale } from "@/lib/i18n/locale-constants";

interface VerifyEmailProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  verifyUrl: string;
  expiresInHours: number;
  t: Dictionary["emails"];
  locale: Locale;
}

export default function VerifyEmail({
  storeName,
  logoUrl,
  primaryColor,
  verifyUrl,
  expiresInHours,
  t,
  locale,
}: VerifyEmailProps) {
  return (
    <Html lang={locale} dir={localeDir(locale)}>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: { colors: { brand: primaryColor } } },
        }}
      >
        <Head />
        <Preview>{applyTemplate(t.verifyPreview, { storeName })}</Preview>
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
                {t.verifyHeading}
              </Heading>
              <Text className="mt-4 text-sm leading-6 text-[#4a453d]">
                {applyTemplate(t.verifyBody, { storeName })}
              </Text>
              <Button
                href={verifyUrl}
                className="bg-brand mt-6 box-border rounded-md px-6 py-3 text-sm font-medium text-white no-underline"
              >
                {t.verifyButton}
              </Button>
              <Text className="mt-6 text-xs leading-5 text-[#8a8377]">
                {applyTemplate(t.verifyExpiry, { hours: expiresInHours })}
              </Text>
              <Hr className="my-6 border-solid border-[#ece7dd]" />
              <Text className="m-0 text-xs text-[#a39c8d]">
                {t.copyLinkHint}
                <br />
                {verifyUrl}
              </Text>
            </Section>
            <Text className="mt-6 text-center text-xs text-[#a39c8d]">
              {applyTemplate(t.tagline, { storeName })}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

VerifyEmail.PreviewProps = {
  storeName: "Perla Murano Glass",
  logoUrl: null,
  primaryColor: "#0f6e5e",
  verifyUrl: "https://perlamuranoglass.com/api/auth/verify-email?token=abc123",
  expiresInHours: 24,
  t: getDictionary("en").emails,
  locale: "en",
} satisfies VerifyEmailProps;

export { VerifyEmail };
