import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGroups, useCreateGroup } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SkeletonTable, EmptyState, Badge } from "@/components/ui/helpers";
import { Pagination } from "@/components/ui/pagination";
import { Users, Plus, Search, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export default function GroupsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGroups({
    page,
    search: search || undefined,
    page_size: 12,
  });
  const { mutate: createGroup, isPending } = useCreateGroup();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const groups = data?.results || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Manage your expense sharing groups</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New group
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        <Input
          className="pl-9"
          placeholder="Search groups…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group to start splitting expenses."
          action={
            <Button variant="primary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Create your first group
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <div className="card-hover p-5 h-full flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
                      {group.name[0].toUpperCase()}
                    </div>
                    {group.user_role === "admin" && (
                      <Badge variant="amber">Admin</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-ink-900 mb-1">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-xs text-ink-500 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-400 pt-2 border-t border-ink-50">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {group.member_count} member
                      {group.member_count !== 1 ? "s" : ""}
                    </span>
                    <span>
                      {format(new Date(group.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={data?.total_pages || 1}
            onPageChange={setPage}
          />
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new group</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) =>
              createGroup(d, {
                onSuccess: () => {
                  setOpen(false);
                  reset();
                },
              }),
            )}
          >
            <div className="px-6 py-4 space-y-4">
              <FormField
                label="Group name"
                error={errors.name?.message}
                required
              >
                <Input
                  placeholder="e.g. Apartment 3B, Spain Trip…"
                  {...register("name")}
                  error={!!errors.name}
                />
              </FormField>
              <FormField
                label="Description"
                error={errors.description?.message}
              >
                <Input
                  placeholder="What's this group for?"
                  {...register("description")}
                />
              </FormField>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isPending}>
                Create group
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
