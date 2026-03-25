import { Outlet, Link } from "react-router-dom";
import { DollarSign } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-950 via-ink-900 to-brand-950 flex">
      {/* Left panel &mdash; branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-brand-400 opacity-5 rounded-full blur-3xl" />

        <Link to="/" className="relative flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <DollarSign className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-display font-bold text-white tracking-tight">
            Akant
          </span>
        </Link>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-white leading-tight">
              Split expenses.
              <br />
              Keep friendships.
            </h1>
            <p className="text-ink-400 text-lg leading-relaxed">
              Track shared costs, simplify who owes what, and settle up
              instantly with Paystack.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Groups", value: "10K+" },
              { label: "Settled debts", value: "₦2B+" },
              { label: "Active users", value: "50K+" },
              { label: "Avg time to settle", value: "< 2 days" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <div className="text-xl font-display font-bold text-white">
                  {value}
                </div>
                <div className="text-xs text-ink-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ink-600">
          © {new Date().getFullYear()} Akant. All rights reserved.
        </p>
      </div>

      {/* Right panel &mdash; form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-display font-bold text-ink-900">
              Akant
            </span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
