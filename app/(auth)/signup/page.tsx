import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-center">Create an account</h2>
      <SignupForm />
    </>
  );
}
