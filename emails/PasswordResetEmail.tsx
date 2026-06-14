import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Button,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}>
          <Heading style={{ fontSize: 24, marginBottom: 16 }}>Reset your password</Heading>
          <Text style={{ color: "#374151", lineHeight: 1.6 }}>
            We received a request to reset your password. Click the button below to choose a new one.
          </Text>
          <Button
            href={resetUrl}
            style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12px 24px", borderRadius: 6, textDecoration: "none", display: "inline-block", marginTop: 16 }}
          >
            Reset Password
          </Button>
          <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 24 }}>
            If you didn&apos;t request a password reset, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
