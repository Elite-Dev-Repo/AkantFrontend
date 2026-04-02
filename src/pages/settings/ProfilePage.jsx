import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMe,
  useUpdateProfile,
  useChangePassword,
  useLogout,
  fetchAccountDetails,
  useAddAccountDetails,
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
  account_name: z.string().min(10, "At least 10 characters"),
  account_number: z.string().min(10, "At least 11 characters"),
  bank_name: z.string().min(4, "At least 4 characters"),
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

  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPwd } =
    useChangePassword();
  const { mutate: addAccount, isPending: addingAccount } =
    useAddAccountDetails();
  const { mutate: deleteAccount, isPending: deletingAccount } =
    useDeleteAccountDetails();
  const { mutate: logout } = useLogout();

  const profileForm = useForm({ resolver: zodResolver(profileSchema) });
  const accountForm = useForm({ resolver: zodResolver(accountSchema) });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        phone: user.phone || "",
      });

      const getAccount = async () => {
        const data = await fetchAccountDetails(user.id);
        if (data) {
          accountForm.reset({
            account_name: data.account_name || "",
            account_number: data.account_number || "",
            bank_name: data.bank_name || "",
          });
        }
      };
      getAccount();
    }
  }, [user, profileForm, accountForm]);

  const handleDeleteAccount = () => {
    if (window.confirm("Delete bank details?")) {
      deleteAccount(user.id, {
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
            <FormField
              label="Phone"
              error={profileForm.formState.errors.phone?.message}
            >
              <Input type="tel" {...profileForm.register("phone")} />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={updating}>
                <User className="mr-2 h-4 w-4" /> Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Bank Account
          </CardTitle>
          <CardDescription>Details for receiving payments</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={accountForm.handleSubmit((d) => addAccount(d))}
            className="space-y-4"
          >
            <FormField
              label="Account Name"
              error={accountForm.formState.errors.account_name?.message}
              required
            >
              <Input {...accountForm.register("account_name")} />
            </FormField>
            <FormField
              label="Account Number"
              error={accountForm.formState.errors.account_number?.message}
              required
            >
              <Input
                type="text"
                inputMode="numeric"
                {...accountForm.register("account_number")}
              />
            </FormField>
            <FormField
              label="Bank Name"
              error={accountForm.formState.errors.bank_name?.message}
              required
            >
              <Input {...accountForm.register("bank_name")} />
            </FormField>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAccount}
                loading={deletingAccount}
              >
                Delete
              </Button>
              <Button type="submit" variant="primary" loading={addingAccount}>
                Save Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((d) => changePassword(d))}
            className="space-y-4"
          >
            <FormField
              label="Current Password"
              error={passwordForm.formState.errors.old_password?.message}
              required
            >
              <Input
                type="password"
                {...passwordForm.register("old_password")}
              />
            </FormField>
            <FormField
              label="New Password"
              error={passwordForm.formState.errors.new_password?.message}
              required
            >
              <Input
                type="password"
                {...passwordForm.register("new_password")}
              />
            </FormField>
            <FormField
              label="Confirm New Password"
              error={
                passwordForm.formState.errors.new_password_confirm?.message
              }
              required
            >
              <Input
                type="password"
                {...passwordForm.register("new_password_confirm")}
              />
            </FormField>
            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={changingPwd}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-rose-200">
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
