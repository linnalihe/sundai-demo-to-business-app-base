import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-center">Welcome back</h2>
      <LoginForm />
    </>
  );
}
