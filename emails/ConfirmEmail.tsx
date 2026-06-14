import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Button,
} from "@react-email/components";

interface ConfirmEmailProps {
  confirmationUrl: string;
}

export default function ConfirmEmail({ confirmationUrl }: ConfirmEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}>
          <Heading style={{ fontSize: 24, marginBottom: 16 }}>Confirm your email</Heading>
          <Text style={{ color: "#374151", lineHeight: 1.6 }}>
            Click the button below to confirm your email address and activate your account.
          </Text>
          <Button
            href={confirmationUrl}
            style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12px 24px", borderRadius: 6, textDecoration: "none", display: "inline-block", marginTop: 16 }}
          >
            Confirm Email
          </Button>
          <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 24 }}>
            If you didn&apos;t create an account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
