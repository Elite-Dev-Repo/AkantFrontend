import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink-900">
          Welcome back
        </h1>
        <p className="text-ink-500 mt-2">Sign in to your Akant account</p>
      </div>

      <form onSubmit={handleSubmit((d) => login(d))} className="space-y-5">
        <FormField label="Email address" error={errors.email?.message} required>
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={!!errors.email}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <Input
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={!!errors.password}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          loading={isPending}
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Don&#39;t have an account?{" "}
        <Link
          to="/register"
          className="text-brand-600 font-medium hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
