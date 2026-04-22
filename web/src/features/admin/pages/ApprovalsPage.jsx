import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  useGetPendingUsersQuery,
  useGetApprovedUsersQuery,
  useGetRejectedUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useRevokeUserMutation,
  useDeleteUserMutation,
  useBulkApproveMutation,
  useBulkRejectMutation,
} from '../state/adminApi';

// ── helpers ──────────────────────────────────────────────────────────────────
const TABS = ['Pending', 'Approved', 'Rejected'];

const roleBadge = (roles) => {
  const role = [...(roles ?? [])][0]?.replace('ROLE_', '') ?? '—';
  const colors = { STUDENT: 'bg-blue-50 text-blue-700', FACULTY: 'bg-purple-50 text-purple-700' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  );
};

const fmt = (dt) => dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ count, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Reject {count > 1 ? `${count} users` : 'user'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">Optionally provide a reason. The account will be disabled.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)"
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || null)}
            className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ApprovalsPage = () => {
  const [tab, setTab]           = useState(0);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [selected, setSelected] = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null); // { ids: [], isBulk }

  const { data: pending  = [], isLoading: l0 } = useGetPendingUsersQuery();
  const { data: approved = [], isLoading: l1 } = useGetApprovedUsersQuery();
  const { data: rejected = [], isLoading: l2 } = useGetRejectedUsersQuery();

  const [approveUser]  = useApproveUserMutation();
  const [rejectUser]   = useRejectUserMutation();
  const [revokeUser]   = useRevokeUserMutation();
  const [deleteUser]   = useDeleteUserMutation();
  const [bulkApprove]  = useBulkApproveMutation();
  const [bulkReject]   = useBulkRejectMutation();

  const lists = [pending, approved, rejected];
  const loading = [l0, l1, l2][tab];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lists[tab].filter((u) => {
      const matchSearch = !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        || u.registrationNumber?.toLowerCase().includes(q) || u.facultyId?.toLowerCase().includes(q);
      const matchRole = !roleFilter || [...(u.roles ?? [])][0] === roleFilter;
      return matchSearch && matchRole;
    });
  }, [lists, tab, search, roleFilter]);

  const allSelected = filtered.length > 0 && filtered.every((u) => selected.includes(u.id));

  const toggleAll = () =>
    setSelected(allSelected ? [] : filtered.map((u) => u.id));

  const toggleOne = (id) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const clearSelection = () => setSelected([]);

  // ── actions ──
  const handleApprove = (id) =>
    approveUser(id).unwrap()
      .then(() => { toast.success('User approved'); clearSelection(); })
      .catch(() => toast.error('Failed to approve'));

  const handleRejectConfirm = async (reason) => {
    const { ids, isBulk } = rejectTarget;
    setRejectTarget(null);
    try {
      if (isBulk) {
        await bulkReject({ userIds: ids, reason }).unwrap();
        toast.success(`${ids.length} users rejected`);
      } else {
        await rejectUser({ userId: ids[0], reason }).unwrap();
        toast.success('User rejected');
      }
      clearSelection();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const handleRevoke = (id) =>
    revokeUser(id).unwrap()
      .then(() => { toast.success('Approval revoked'); clearSelection(); })
      .catch(() => toast.error('Failed to revoke'));

  const handleDelete = (id) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    deleteUser(id).unwrap()
      .then(() => { toast.success('User deleted'); clearSelection(); })
      .catch(() => toast.error('Failed to delete'));
  };

  const handleBulkApprove = () =>
    bulkApprove(selected).unwrap()
      .then(() => { toast.success(`${selected.length} users approved`); clearSelection(); })
      .catch(() => toast.error('Bulk approve failed'));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user registration requests</p>
        </div>
        {pending.length > 0 && (
          <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => { setTab(i); clearSelection(); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2
              ${tab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${tab === i ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
              {lists[i].length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, ID..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64 bg-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="">All roles</option>
          <option value="ROLE_STUDENT">Student</option>
          <option value="ROLE_FACULTY">Faculty</option>
        </select>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-indigo-700">{selected.length} selected</span>
            {tab === 0 && (
              <>
                <button onClick={handleBulkApprove}
                  className="px-3 py-1 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  Approve All
                </button>
                <button onClick={() => setRejectTarget({ ids: selected, isBulk: true })}
                  className="px-3 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg">
                  Reject All
                </button>
              </>
            )}
            <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-gray-600 ml-1">✕</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            {search || roleFilter ? 'No results match your filters.' : `No ${TABS[tab].toLowerCase()} users.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {tab === 0 && (
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400" />
                    </th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID / Reg No</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered</th>
                  {tab === 2 && (
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id}
                    className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/40 transition-colors
                      ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}
                      ${selected.includes(user.id) ? 'bg-indigo-50' : ''}`}>
                    {tab === 0 && (
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleOne(user.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-400" />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.roles)}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {user.registrationNumber || user.facultyId || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmt(user.createdAt)}</td>
                    {tab === 2 && (
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate" title={user.rejectionReason}>
                        {user.rejectionReason || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Pending: Approve + Reject */}
                        {tab === 0 && (
                          <>
                            <button onClick={() => handleApprove(user.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                              Approve
                            </button>
                            <button onClick={() => setRejectTarget({ ids: [user.id], isBulk: false })}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        {/* Approved: Revoke */}
                        {tab === 1 && (
                          <button onClick={() => handleRevoke(user.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                            Revoke
                          </button>
                        )}
                        {/* Rejected: Re-approve */}
                        {tab === 2 && (
                          <button onClick={() => handleApprove(user.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                            Re-approve
                          </button>
                        )}
                        {/* Delete always available */}
                        <button onClick={() => handleDelete(user.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          count={rejectTarget.ids.length}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default ApprovalsPage;
