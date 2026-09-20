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

interface ResetPasswordEmailProps {
  storeName: string;
  logoUrl: string | null;
  primaryColor: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export default function ResetPasswordEmail({
  storeName,
  logoUrl,
  primaryColor,
  resetUrl,
  expiresInMinutes,
}: ResetPasswordEmailProps) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: { extend: { colors: { brand: primaryColor } } },
        }}
      >
        <Head />
        <Preview>Reset your password — {storeName}</Preview>
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
                Reset your password
              </Heading>
              <Text className="mt-4 text-sm leading-6 text-[#4a453d]">
                We received a request to reset the password for your {storeName} account. Choose a
                new one using the button below.
              </Text>
              <Button
                href={resetUrl}
                className="bg-brand mt-6 box-border rounded-md px-6 py-3 text-sm font-medium text-white no-underline"
              >
                Choose a new password
              </Button>
              <Text className="mt-6 text-xs leading-5 text-[#8a8377]">
                This link expires in {expiresInMinutes} minutes and can be used once. If you
                didn&apos;t ask for this, you can safely ignore this email — your password
                won&apos;t change.
              </Text>
              <Hr className="my-6 border-solid border-[#ece7dd]" />
              <Text className="m-0 text-xs text-[#a39c8d]">
                If the button doesn&apos;t work, copy and paste this link into your browser:
                <br />
                {resetUrl}
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

ResetPasswordEmail.PreviewProps = {
  storeName: "Perla Murano Glass",
  logoUrl: null,
  primaryColor: "#0f6e5e",
  resetUrl: "https://perlamuranoglass.com/reset-password?token=abc123",
  expiresInMinutes: 60,
} satisfies ResetPasswordEmailProps;

export { ResetPasswordEmail };
