import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetRegistrationWindowsQuery,
  useCreateRegistrationWindowMutation,
  useUpdateRegistrationWindowMutation,
  useDeleteRegistrationWindowMutation,
  useToggleRegistrationWindowMutation,
} from '../state/adminApi';
import { useGetBatchesQuery } from '../courses/coursesAdminApi';

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (w) => {
  if (!w.active)        return { label: 'Disabled',  cls: 'bg-red-50 text-red-600 border-red-200' };
  if (w.currentlyOpen)  return { label: 'Open',       cls: 'bg-green-50 text-green-700 border-green-200' };
  const today = new Date().toISOString().split('T')[0];
  if (w.openDate > today)  return { label: 'Scheduled',  cls: 'bg-blue-50 text-blue-700 border-blue-200' };
  return                          { label: 'Closed',     cls: 'bg-gray-100 text-gray-500 border-gray-200' };
};

const roleBadge = (role) =>
  role === 'ROLE_STUDENT'
    ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Student</span>
    : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Faculty</span>;

const EMPTY_FORM = { role: 'ROLE_STUDENT', batchId: '', openDate: '', closeDate: '', allowedYearOfStudy: 1, active: true };

// ── Modal ─────────────────────────────────────────────────────────────────────
const WindowModal = ({ initial, onClose }) => {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [err, setErr]   = useState('');

  const { data: batches = [] } = useGetBatchesQuery();
  const [create, { isLoading: creating }] = useCreateRegistrationWindowMutation();
  const [update, { isLoading: updating }] = useUpdateRegistrationWindowMutation();
  const isEdit = !!initial?.id;
  const busy   = creating || updating;
  const isFaculty = form.role === 'ROLE_FACULTY';

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedBatch = batches.find((b) => b.id === Number(form.batchId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!isFaculty && !form.batchId) return setErr('Please select a batch.');
    if (!form.openDate)  return setErr('Open date is required.');
    if (!form.closeDate) return setErr('Close date is required.');
    if (form.openDate >= form.closeDate) return setErr('Close date must be after open date.');
    if (!isFaculty && !form.allowedYearOfStudy) return setErr('Year of study is required for students.');

    const payload = {
      batchId: isFaculty ? null : Number(form.batchId),
      role: form.role,
      openDate: form.openDate,
      closeDate: form.closeDate,
      allowedYearOfStudy: isFaculty ? null : Number(form.allowedYearOfStudy),
      active: form.active,
    };

    try {
      if (isEdit) {
        await update({ id: initial.id, ...payload }).unwrap();
        toast.success('Window updated');
      } else {
        await create(payload).unwrap();
        toast.success('Window created');
      }
      onClose();
    } catch (ex) {
      toast.error(ex?.data?.message ?? 'Failed to save window');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Window' : 'Add Registration Window'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
            <div className="flex gap-2">
              {['ROLE_STUDENT', 'ROLE_FACULTY'].map((r) => (
                <button key={r} type="button"
                  onClick={() => set('role', r) || setForm((f) => ({ ...f, role: r, batchId: '', allowedYearOfStudy: r === 'ROLE_STUDENT' ? 1 : null }))}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-colors
                    ${form.role === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {r === 'ROLE_STUDENT' ? 'Student' : 'Faculty'}
                </button>
              ))}
            </div>
          </div>

          {/* Batch — students only */}
          {!isFaculty && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Batch</label>
              <select value={form.batchId} onChange={(e) => set('batchId', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                <option value="">Select batch…</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.startYear}–{b.endYear} ({b.scheme})</option>
                ))}
              </select>
            </div>
          )}

          {/* Year of Study — students only */}
          {!isFaculty && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Year of Study</label>
              <input type="number" min={1} max={4} value={form.allowedYearOfStudy}
                onChange={(e) => set('allowedYearOfStudy', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              {selectedBatch && (
                <p className="text-xs text-gray-400 mt-1">
                  For batch {selectedBatch.startYear}–{selectedBatch.endYear}, Year 1 = students joining in {selectedBatch.startYear}
                </p>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Open Date</label>
              <input type="date" value={form.openDate} onChange={(e) => set('openDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Close Date</label>
              <input type="date" value={form.closeDate} onChange={(e) => set('closeDate', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400" />
            <span className="text-sm text-gray-700">Window is active</span>
          </label>

          {err && <p className="text-xs text-red-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={busy}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60">
              {busy ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const AdminRegistrationWindowsPage = () => {
  const { data: windows = [], isLoading } = useGetRegistrationWindowsQuery();
  const [deleteWindow] = useDeleteRegistrationWindowMutation();
  const [toggleWindow] = useToggleRegistrationWindowMutation();
  const [modal, setModal] = useState(null); // null | 'add' | { window obj }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this registration window?')) return;
    deleteWindow(id).unwrap()
      .then(() => toast.success('Window deleted'))
      .catch(() => toast.error('Failed to delete'));
  };

  const handleToggle = (id) => {
    toggleWindow(id).unwrap()
      .then(() => toast.success('Status updated'))
      .catch(() => toast.error('Failed to update status'));
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Registration Windows</h1>
            <p className="text-xs text-gray-400 mt-0.5">Control when students and faculty can register</p>
          </div>
          <button onClick={() => setModal('add')}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            + Add Window
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
          </div>
        ) : windows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No registration windows yet. Click <strong>+ Add Window</strong> to create one.
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Batch', 'Role', 'Year', 'Open Date', 'Close Date', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {windows.map((w, i) => {
                    const { label, cls } = statusBadge(w);
                    return (
                      <tr key={w.id}
                        className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {w.batchStartYear ? `${w.batchStartYear}–${w.batchEndYear}` : '—'}
                          {w.batchScheme && <span className="ml-1.5 text-xs text-gray-400">{w.batchScheme}</span>}
                        </td>
                        <td className="px-4 py-3">{roleBadge(w.role)}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {w.allowedYearOfStudy ? `Year ${w.allowedYearOfStudy}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(w.openDate)}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(w.closeDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setModal(w)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-gray-600 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleToggle(w.id)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors
                                ${w.active
                                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                  : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                              {w.active ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => handleDelete(w.id)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 transition-colors">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <WindowModal
          initial={modal === 'add' ? null : {
            id: modal.id,
            role: modal.role,
            batchId: modal.batchId ?? '',
            openDate: modal.openDate,
            closeDate: modal.closeDate,
            allowedYearOfStudy: modal.allowedYearOfStudy ?? 1,
            active: modal.active,
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default AdminRegistrationWindowsPage;
