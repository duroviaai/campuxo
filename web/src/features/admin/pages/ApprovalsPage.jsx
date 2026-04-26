import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  useGetDepartmentsSummaryQuery,
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
import { useGetDepartmentsQuery } from '../courses/coursesAdminApi';
import { useGetStudentByIdQuery } from '../../student/state/studentApi';

// ── helpers ───────────────────────────────────────────────────────────────────
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
          <button onClick={() => onConfirm(reason || null)}
            className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg">
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// ── User detail slide-over ───────────────────────────────────────────────────
const SchemeBadge = ({ scheme }) => scheme ? (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
    scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
  }`}>{scheme}</span>
) : null;

const Avatar = ({ name }) => {
  const initials = (name ?? '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-base shrink-0">
      {initials}
    </div>
  );
};

const UserDetail = ({ user, onClose, onApprove, onReject, onRevoke, tab }) => {
  const isStudent = [...(user.roles ?? [])][0] === 'ROLE_STUDENT';
  const { data: profile, isLoading } = useGetStudentByIdQuery(user.profileId, { skip: !isStudent || !user.profileId });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-xs text-indigo-600 hover:underline">← Back</button>
          <div className="flex gap-2">
            {tab === 0 && (
              <>
                <button onClick={() => { onApprove(user.id); onClose(); }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white">
                  Approve
                </button>
                <button onClick={() => { onReject(user.id); onClose(); }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white">
                  Reject
                </button>
              </>
            )}
            {tab === 1 && (
              <button onClick={() => { onRevoke(user.id); onClose(); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white">
                Revoke
              </button>
            )}
            {tab === 2 && (
              <button onClick={() => { onApprove(user.id); onClose(); }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white">
                Re-approve
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Profile strip */}
          <div className="flex items-center gap-4">
            <Avatar name={user.fullName} />
            <div>
              <p className="text-lg font-bold text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
              <div className="mt-1">{roleBadge(user.roles)}</div>
            </div>
          </div>

          {/* Basic info from AdminResponseDTO */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Reg / Faculty ID', user.registrationNumber || user.facultyId],
              ['Department',       user.department],
              ['Registered',       fmt(user.createdAt)],
              ...(user.rejectionReason ? [['Rejection Reason', user.rejectionReason]] : []),
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Student profile details */}
          {isStudent && (
            isLoading ? (
              <div className="space-y-2">
                {[1,2,3,4].map((i) => <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />)}
              </div>
            ) : profile ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Student Profile</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Phone',         profile.phone],
                    ['Year of Study',  profile.yearOfStudy ? `Year ${profile.yearOfStudy}` : null],
                    ['Batch',          profile.classBatchStartYear ? `${profile.classBatchStartYear}–${profile.classBatchEndYear}` : null],
                    ['Date of Birth',  profile.dateOfBirth],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                  {profile.scheme && (
                    <div>
                      <p className="text-xs text-gray-400">Scheme</p>
                      <div className="mt-0.5"><SchemeBadge scheme={profile.scheme} /></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No student profile filled yet.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ── Department list (level 0) ─────────────────────────────────────────────────
const DeptList = ({ onSelect }) => {
  const { data: depts = [], isLoading: deptsLoading } = useGetDepartmentsQuery();
  const { data: summary = {}, isLoading: summaryLoading } = useGetDepartmentsSummaryQuery();
  const { data: pending = [] } = useGetPendingUsersQuery({});

  const isLoading = deptsLoading || summaryLoading;

  // Also show an "All Departments" card
  const totalPending = pending.length;

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Select a department to manage its approval requests.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* All departments card */}
        <div onClick={() => onSelect(null)}
          className="relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
          <p className="text-base font-bold text-gray-900">All Departments</p>
          <p className="text-xs text-gray-400 mt-1">View all users across departments</p>
          {totalPending > 0 && (
            <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {totalPending}
            </span>
          )}
          <div className="absolute bottom-3 right-4 text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Open →</div>
        </div>

        {depts.map((d) => {
          const pendingCount = summary[d.name] ?? 0;
          return (
            <div key={d.id} onClick={() => onSelect(d.name)}
              className="relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
              <p className="text-base font-bold text-gray-900">{d.name}</p>
              {pendingCount > 0 && (
                <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {pendingCount}
                </span>
              )}
              <div className="absolute bottom-3 right-4 text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Open →</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Approvals table (level 1) ─────────────────────────────────────────────────
const ApprovalsTable = ({ department, onBack }) => {
  const [tab, setTab]           = useState(0);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('');
  const [selected, setSelected] = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const deptArg = department ? { department } : {};
  const { data: pending  = [], isLoading: l0 } = useGetPendingUsersQuery(deptArg);
  const { data: approved = [], isLoading: l1 } = useGetApprovedUsersQuery(deptArg);
  const { data: rejected = [], isLoading: l2 } = useGetRejectedUsersQuery(deptArg);

  const [approveUser] = useApproveUserMutation();
  const [rejectUser]  = useRejectUserMutation();
  const [revokeUser]  = useRevokeUserMutation();
  const [deleteUser]  = useDeleteUserMutation();
  const [bulkApprove] = useBulkApproveMutation();
  const [bulkReject]  = useBulkRejectMutation();

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
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((u) => u.id));
  const toggleOne = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const clearSelection = () => setSelected([]);

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
    } catch { toast.error('Failed to reject'); }
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
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <button onClick={onBack} className="text-indigo-600 hover:underline">← Departments</button>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">{department ?? 'All Departments'}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => { setTab(i); clearSelection(); }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2
              ${tab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${tab === i ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
              {lists[i].length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters + bulk actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, ID..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64 bg-white" />
        <select value={roleFilter} onChange={(e) => setRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
          <option value="">All roles</option>
          <option value="ROLE_STUDENT">Student</option>
          <option value="ROLE_FACULTY">Faculty</option>
        </select>
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
      <div className="rounded-xl border border-gray-200 overflow-hidden">
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
                  {['Name', 'Email', 'Role', 'ID / Reg No', 'Registered', ...(tab === 2 ? ['Reason'] : []), 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id} onClick={() => setViewUser(user)}
                    className={`cursor-pointer border-b border-gray-100 last:border-0 hover:bg-indigo-50/40 transition-colors
                      ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}
                      ${selected.includes(user.id) ? 'bg-indigo-50' : ''}`}>
                    {tab === 0 && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
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
                        {tab === 1 && (
                          <button onClick={() => handleRevoke(user.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                            Revoke
                          </button>
                        )}
                        {tab === 2 && (
                          <button onClick={() => handleApprove(user.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                            Re-approve
                          </button>
                        )}
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

      {rejectTarget && (
        <RejectModal count={rejectTarget.ids.length} onConfirm={handleRejectConfirm} onClose={() => setRejectTarget(null)} />
      )}

      {viewUser && (
        <UserDetail
          user={viewUser}
          tab={tab}
          onClose={() => setViewUser(null)}
          onApprove={handleApprove}
          onReject={(id) => setRejectTarget({ ids: [id], isBulk: false })}
          onRevoke={handleRevoke}
        />
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ApprovalsPage = () => {
  const [department, setDepartment] = useState(undefined); // undefined = dept list, null = all, string = specific dept
  const { data: pending = [] } = useGetPendingUsersQuery({});

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user registration requests by department</p>
        </div>
        {department === undefined && pending.length > 0 && (
          <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {pending.length} pending
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {department === undefined ? (
          <DeptList onSelect={(d) => setDepartment(d === null ? null : d)} />
        ) : (
          <ApprovalsTable department={department} onBack={() => setDepartment(undefined)} />
        )}
      </div>
    </div>
  );
};

export default ApprovalsPage;
