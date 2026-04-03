import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMe,
  useUpdateProfile,
  useChangePassword,
  useLogout,
  useAccountDetails,
  useSaveAccountDetails,
  useDeleteAccountDetails,
} from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar";
import { PageLoader } from "@/components/ui/helpers";
import { CreditCard, LogOut, Shield, User } from "lucide-react";

const profileSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  username: z.string().min(3, "At least 3 characters"),
  phone: z.string().optional(),
});

const accountSchema = z.object({
  account_name: z.string().min(2, "Required"),
  account_number: z.string().length(10, "Must be exactly 10 digits"),
  bank_name: z.string().min(2, "Required"),
});

const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Enter current password"),
    new_password: z.string().min(8, "At least 8 characters"),
    new_password_confirm: z.string(),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: "Passwords do not match",
    path: ["new_password_confirm"],
  });

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();
  const user = useAuthStore((s) => s.user) || me;

  const { data: accountList } = useAccountDetails();
  const existingAccount = Array.isArray(accountList) ? accountList[0] : null;

  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPwd } =
    useChangePassword();
  const { mutate: saveAccount, isPending: savingAccount } =
    useSaveAccountDetails();
  const { mutate: deleteAccount, isPending: deletingAccount } =
    useDeleteAccountDetails();
  const { mutate: logout } = useLogout();

  const profileForm = useForm({ resolver: zodResolver(profileSchema) });
  const accountForm = useForm({ resolver: zodResolver(accountSchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  // Populate profile form
  useEffect(() => {
    if (user) {
      profileForm.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Populate account form when data loads
  useEffect(() => {
    if (existingAccount) {
      accountForm.reset({
        account_name: existingAccount.account_name || "",
        account_number: existingAccount.account_number || "",
        bank_name: existingAccount.bank_name || "",
      });
    }
  }, [existingAccount]);

  const handleDeleteAccount = () => {
    if (!existingAccount) return;
    if (window.confirm("Remove your bank account details?")) {
      deleteAccount(existingAccount.id, {
        onSuccess: () =>
          accountForm.reset({
            account_name: "",
            account_number: "",
            bank_name: "",
          }),
      });
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="xl" />
            <div>
              <CardTitle>{user?.full_name || user?.username}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((d) => updateProfile(d))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="First name"
                error={profileForm.formState.errors.first_name?.message}
                required
              >
                <Input {...profileForm.register("first_name")} />
              </FormField>
              <FormField
                label="Last name"
                error={profileForm.formState.errors.last_name?.message}
                required
              >
                <Input {...profileForm.register("last_name")} />
              </FormField>
            </div>
            <FormField
              label="Username"
              error={profileForm.formState.errors.username?.message}
              required
            >
              <Input {...profileForm.register("username")} />
            </FormField>
            <FormField label="Email address">
              <Input
                value={user?.email || ""}
                disabled
                className="bg-ink-50 text-ink-500"
              />
            </FormField>
            <FormField
              label="Phone number"
              error={profileForm.formState.errors.phone?.message}
            >
              <Input
                type="tel"
                placeholder="+234 800 000 0000"
                {...profileForm.register("phone")}
              />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={updating}>
                <User className="h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bank account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-ink-500" /> Bank Account
          </CardTitle>
          <CardDescription>
            {existingAccount
              ? "Your bank details are visible to group members who owe you money."
              : "Add your bank details so group members can pay you directly."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={accountForm.handleSubmit((d) =>
              saveAccount({ ...d, id: existingAccount?.id }),
            )}
            className="space-y-4"
          >
            <FormField
              label="Account name"
              error={accountForm.formState.errors.account_name?.message}
              required
            >
              <Input
                placeholder="e.g. Chidi Nwosu"
                {...accountForm.register("account_name")}
              />
            </FormField>
            <FormField
              label="Account number"
              error={accountForm.formState.errors.account_number?.message}
              required
            >
              <Input
                placeholder="0123456789"
                maxLength={10}
                inputMode="numeric"
                {...accountForm.register("account_number")}
              />
            </FormField>
            <FormField
              label="Bank name"
              error={accountForm.formState.errors.bank_name?.message}
              required
            >
              <Input
                placeholder="e.g. GTBank, Access, Zenith"
                {...accountForm.register("bank_name")}
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              {existingAccount && (
                <Button
                  type="button"
                  variant="destructive"
                  loading={deletingAccount}
                  onClick={handleDeleteAccount}
                >
                  Remove
                </Button>
              )}
              <Button type="submit" variant="primary" loading={savingAccount}>
                {existingAccount ? "Update account" : "Save account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-ink-500" /> Change password
          </CardTitle>
          <CardDescription>
            Use a strong password with at least 8 characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((d) => {
              changePassword(d);
              passwordForm.reset();
            })}
            className="space-y-4"
          >
            <FormField
              label="Current password"
              error={passwordForm.formState.errors.old_password?.message}
              required
            >
              <Input
                type="password"
                placeholder="••••••••"
                {...passwordForm.register("old_password")}
              />
            </FormField>
            <FormField
              label="New password"
              error={passwordForm.formState.errors.new_password?.message}
              required
            >
              <Input
                type="password"
                placeholder="At least 8 characters"
                {...passwordForm.register("new_password")}
              />
            </FormField>
            <FormField
              label="Confirm new password"
              error={
                passwordForm.formState.errors.new_password_confirm?.message
              }
              required
            >
              <Input
                type="password"
                placeholder="Repeat new password"
                {...passwordForm.register("new_password_confirm")}
              />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={changingPwd}>
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card className="border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-700">Sign out</CardTitle>
          <CardDescription>
            Sign out of your Akant account on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
