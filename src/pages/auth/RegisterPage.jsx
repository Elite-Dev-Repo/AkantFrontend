import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

export default function RegisterPage() {
  const { mutate: register_, isPending } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink-900">
          Create your account
        </h1>
        <p className="text-ink-500 mt-2">Start splitting expenses in seconds</p>
      </div>

      <form onSubmit={handleSubmit((d) => register_(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First name"
            error={errors.first_name?.message}
            required
          >
            <Input
              placeholder="Ada"
              {...register("first_name")}
              error={!!errors.first_name}
            />
          </FormField>
          <FormField
            label="Last name"
            error={errors.last_name?.message}
            required
          >
            <Input
              placeholder="Lovelace"
              {...register("last_name")}
              error={!!errors.last_name}
            />
          </FormField>
        </div>
        <FormField label="Username" error={errors.username?.message} required>
          <Input
            placeholder="ada_splits"
            {...register("username")}
            error={!!errors.username}
          />
        </FormField>
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
            placeholder="At least 8 characters"
            {...register("password")}
            error={!!errors.password}
          />
        </FormField>
        <FormField
          label="Confirm password"
          error={errors.password_confirm?.message}
          required
        >
          <Input
            type="password"
            placeholder="Repeat password"
            {...register("password_confirm")}
            error={!!errors.password_confirm}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          size="lg"
          loading={isPending}
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-brand-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
