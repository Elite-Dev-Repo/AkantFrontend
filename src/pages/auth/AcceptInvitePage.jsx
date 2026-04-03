import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAcceptInvite } from "@/hooks/useGroups";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/helpers";
import { DollarSign, CheckCircle2, XCircle } from "lucide-react";

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    mutate: accept,
    isPending,
    isSuccess,
    isError,
    error,
  } = useAcceptInvite();

  useEffect(() => {
    if (token && isAuthenticated) accept(token);
  }, [token, isAuthenticated]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="card max-w-md w-full p-8 text-center animate-scale-in">
        <div className="h-12 w-12 rounded-xl bg-brand-500 flex items-center justify-center mx-auto mb-6">
          <p className="text-white text-[1.2em]">₦</p>
        </div>
        {!token && (
          <>
            <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-ink-900 mb-2">
              Invalid invite link
            </h2>
            <p className="text-ink-500 text-sm mb-6">
              This invite link is missing a token.
            </p>
            <Link to="/">
              <Button variant="secondary" className="w-full">
                Go home
              </Button>
            </Link>
          </>
        )}
        {token && !isAuthenticated && (
          <>
            <h2 className="text-xl font-display font-bold text-ink-900 mb-2">
              You&#39;ve been invited!
            </h2>
            <p className="text-ink-500 text-sm mb-6">
              Sign in or create an account to accept this group invitation.
            </p>
            <div className="flex flex-col gap-3">
              <Link to={"/login"}>
                <Button variant="primary" className="w-full">
                  Sign in to accept
                </Button>
              </Link>
              <Link to={"/register"}>
                <Button variant="secondary" className="w-full">
                  Create account
                </Button>
              </Link>
            </div>
          </>
        )}
        {token && isAuthenticated && isPending && (
          <>
            <Spinner className="h-10 w-10 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-ink-900 mb-2">
              Joining group…
            </h2>
          </>
        )}
        {isSuccess && (
          <>
            <CheckCircle2 className="h-12 w-12 text-brand-500 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-ink-900 mb-2">
              You're in!
            </h2>
            <p className="text-ink-500 text-sm mb-6">
              You&#39;ve successfully joined the group.
            </p>
            <Link to="/groups">
              <Button variant="primary" className="w-full">
                View my groups
              </Button>
            </Link>
          </>
        )}
        {isError && (
          <>
            <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-ink-900 mb-2">
              Couldn't join group
            </h2>
            <p className="text-ink-500 text-sm mb-6">
              {error?.response?.data?.message ||
                "This invite may have expired."}
            </p>
            <Link to="/dashboard">
              <Button variant="secondary" className="w-full">
                Go to dashboard
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
