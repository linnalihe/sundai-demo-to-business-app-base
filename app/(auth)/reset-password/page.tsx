import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Reset Password" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ verified?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { verified } = await searchParams;
  return (
    <>
      <h2 className="text-xl font-semibold text-center">Reset your password</h2>
      <ResetPasswordForm verified={verified === "1"} />
    </>
  );
}
