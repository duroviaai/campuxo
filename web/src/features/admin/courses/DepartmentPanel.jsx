import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetDepartmentsQuery,
  useGetSpecializationsByDeptQuery,
  useCreateSpecializationMutation,
  useDeleteSpecializationMutation,
} from './coursesAdminApi';

const SpecChips = ({ dept, batch, onSelect }) => {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const { data: specs = [], isLoading } = useGetSpecializationsByDeptQuery(
    { deptId: dept.id, scheme: batch.scheme },
    { skip: !dept.id }
  );
  const [createSpec, { isLoading: saving }] = useCreateSpecializationMutation();
  const [deleteSpec] = useDeleteSpecializationMutation();

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createSpec({
        name: newName.trim(), department: dept.name,
        scheme: batch.scheme, deptId: dept.id,
      }).unwrap();
      toast.success('Specialization added.');
      setNewName(''); setAdding(false);
    } catch (err) { toast.error(err?.data?.message || 'Failed.'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this specialization?')) return;
    try { await deleteSpec(id).unwrap(); toast.success('Deleted.'); }
    catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2 items-center" onClick={(e) => e.stopPropagation()}>
      {/* "All" chip — no specialization */}
      <button onClick={() => onSelect(dept, null)}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
        All
      </button>

      {isLoading ? (
        <span className="text-xs text-gray-400">Loading…</span>
      ) : (
        specs.map((s) => (
          <div key={s.id} className="flex items-center gap-1 group">
            <button onClick={() => onSelect(dept, s)}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
              {s.name}
            </button>
            <button onClick={(e) => handleDelete(s.id, e)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-xs leading-none">
              ✕
            </button>
          </div>
        ))
      )}

      {adding ? (
        <div className="flex items-center gap-1">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
            placeholder="e.g. AI & ML"
            className="border border-indigo-300 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 w-32" />
          <button onClick={handleAdd} disabled={!newName.trim() || saving}
            className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-600 text-white disabled:opacity-50">
            {saving ? '…' : '✓'}
          </button>
          <button onClick={() => { setAdding(false); setNewName(''); }}
            className="px-2 py-1 text-xs rounded-full border border-gray-200 text-gray-500">✕</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
          + Add
        </button>
      )}
    </div>
  );
};

const DepartmentPanel = ({ batch, onSelect, onBack }) => {
  const { data: departments = [], isLoading } = useGetDepartmentsQuery();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-xs text-indigo-600 hover:underline">← Batches</button>
        <span className="text-gray-300">/</span>
        <h2 className="text-lg font-bold text-gray-900">
          {batch.startYear}–{batch.endYear}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
            batch.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
          }`}>{batch.scheme}</span>
        </h2>
      </div>
      <p className="text-xs text-gray-400">Select a department and specialization to view semesters.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : departments.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No departments configured.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition-colors">
              <p className="text-sm font-bold text-gray-900">{dept.name}</p>
              <SpecChips dept={dept} batch={batch} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentPanel;
