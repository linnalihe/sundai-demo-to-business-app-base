export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-sm space-y-6 p-8 bg-background rounded-xl border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">SaaS Starter</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
