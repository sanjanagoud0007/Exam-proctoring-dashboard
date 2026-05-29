import { useContext, useEffect, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [action, setAction] = useState("approve");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const pageSize = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/auth/users");
      setUsers(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAction = (user, type) => {
    setSelectedUser(user);
    setAction(type);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;
    try {
      if (action === "approve") {
        const { data } = await API.put(
          `/auth/user/${selectedUser._id}/approve`
        );
        setUsers((prev) => prev.map((u) => (u._id === data._id ? data : u)));
        toast(`Approved ${data.name}`, "success");
      } else if (action === "ban") {
        const { data } = await API.put(`/users/${selectedUser._id}/ban`);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === data._id ? { ...u, approved: data.approved } : u
          )
        );
        toast(`Revoked access for ${selectedUser.name}`, "success");
      } else if (action === "delete") {
        await API.delete(`/users/${selectedUser._id}`);
        setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
        toast(`Deleted ${selectedUser.name}`, "success");
      }
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
    setModalOpen(false);
    setSelectedUser(null);
  };

  const createUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await API.post("/users", form);
      setUsers((prev) => [data, ...prev]);
      toast(`Created ${data.name}`, "success");
      setForm({ name: "", email: "", password: "", role: "student" });
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
    setCreating(false);
  };

  return (
    <AppLayout title="Users">
      <PageHeader
        title="User management"
        subtitle="Approve student accounts so they can take exams (proctor or admin)"
      />

      {isAdmin && (
      <GlassCard className="mb-8">
        <h3 className="font-semibold mb-4">Create user</h3>
        <form
          onSubmit={createUser}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
        >
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm text-slate-500 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm"
            >
              <option value="student">Student</option>
              <option value="proctor">Proctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={creating} className="self-end">
            {creating ? "Creating…" : "Create"}
          </Button>
        </form>
      </GlassCard>
      )}

      <div className="mb-4 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 text-sm"
        />
        <Button variant="secondary" onClick={fetchUsers}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <GlassCard className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr key={u._id} className="border-t border-slate-800">
                  <td className="py-3">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3 capitalize">{u.role}</td>
                  <td className="py-3">
                    <Badge variant={u.approved ? "success" : "warning"}>
                      {u.approved ? "Active" : "Pending"}
                    </Badge>
                  </td>
                  <td className="py-3 flex flex-wrap gap-2">
                    {!u.approved && (
                      <Button
                        size="sm"
                        onClick={() => openAction(u, "approve")}
                      >
                        Approve
                      </Button>
                    )}
                    {u.approved && u.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openAction(u, "ban")}
                      >
                        Ban
                      </Button>
                    )}
                    {u.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openAction(u, "delete")}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      <ConfirmModal
        open={modalOpen}
        title={
          action === "approve"
            ? `Approve ${selectedUser?.name}`
            : action === "ban"
              ? `Ban ${selectedUser?.name}`
              : `Delete ${selectedUser?.name}`
        }
        message="This action cannot be undone for delete."
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmAction}
      />
    </AppLayout>
  );
};

export default AdminUsers;
