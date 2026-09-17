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

interface VerifyEmailProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  verifyUrl: string;
  expiresInHours: number;
}

export default function VerifyEmail({
  storeName,
  logoUrl,
  primaryColor,
  verifyUrl,
  expiresInHours,
}: VerifyEmailProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset], theme: { extend: { colors: { brand: primaryColor } } } }}>
        <Head />
        <Preview>Confirm your email address — {storeName}</Preview>
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
                Confirm your email address
              </Heading>
              <Text className="mt-4 text-sm leading-6 text-[#4a453d]">
                Welcome to {storeName}. Confirm your email address to activate your account —
                you&apos;ll need this to leave reviews and save items to your wishlist.
              </Text>
              <Button
                href={verifyUrl}
                className="box-border mt-6 rounded-md bg-brand px-6 py-3 text-sm font-medium text-white no-underline"
              >
                Confirm email address
              </Button>
              <Text className="mt-6 text-xs leading-5 text-[#8a8377]">
                This link expires in {expiresInHours} hours. If you didn&apos;t create this
                account, you can safely ignore this email.
              </Text>
              <Hr className="my-6 border-solid border-[#ece7dd]" />
              <Text className="m-0 text-xs text-[#a39c8d]">
                If the button doesn&apos;t work, copy and paste this link into your browser:
                <br />
                {verifyUrl}
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

VerifyEmail.PreviewProps = {
  storeName: "Perla Murano Glass",
  logoUrl: null,
  primaryColor: "#0f6e5e",
  verifyUrl: "https://perlamuranoglass.com/api/auth/verify-email?token=abc123",
  expiresInHours: 24,
} satisfies VerifyEmailProps;

export { VerifyEmail };
