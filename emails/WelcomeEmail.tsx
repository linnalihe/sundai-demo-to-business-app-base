import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}>
          <Heading style={{ fontSize: 24, marginBottom: 16 }}>Welcome, {firstName}!</Heading>
          <Text style={{ color: "#374151", lineHeight: 1.6 }}>
            Thanks for signing up. Your account is ready to go.
          </Text>
          <Button
            href="http://localhost:3000/dashboard"
            style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12px 24px", borderRadius: 6, textDecoration: "none", display: "inline-block", marginTop: 16 }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
