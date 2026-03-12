"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Search, Clock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLES = ["ADMIN", "INITIATOR", "SIGNER", "REVIEWER"] as const;

const roleVariant: Record<string, "default" | "secondary" | "warning" | "success"> = {
  ADMIN: "default",
  INITIATOR: "success",
  SIGNER: "warning",
  REVIEWER: "secondary",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "INITIATOR" });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 403) {
        toast.error("You do not have permission to view users");
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("User created successfully");
        setForm({ name: "", email: "", password: "", role: "INITIATOR" });
        setShowForm(false);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create user");
      }
    } catch {
      toast.error("Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and roles</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New User
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-5 flex-1 bg-muted rounded" />
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">
                {search ? "No matching users" : "No users yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search
                  ? "Try adjusting your search"
                  : "Create your first user to get started"}
              </p>
              {!search && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-3 text-sm font-medium">{user.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-3">
                        <Badge variant={roleVariant[user.role] || "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.isActive ? "success" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
