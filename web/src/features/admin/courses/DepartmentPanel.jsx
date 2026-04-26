import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetDepartmentsQuery,
  useGetSpecializationsByDeptQuery,
  useCreateSpecializationMutation,
  useDeleteSpecializationMutation,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
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
      await createSpec({ name: newName.trim(), department: dept.name, scheme: batch.scheme, deptId: dept.id }).unwrap();
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
      <button onClick={() => onSelect(dept, null)}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
        All
      </button>
      {isLoading ? <span className="text-xs text-gray-400">Loading…</span> : (
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

const AddDepartmentModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Department name is required.'); return; }
    try {
      await createDepartment({ name: name.trim() }).unwrap();
      toast.success(`Department "${name.trim()}" created.`);
      onClose();
    } catch (err) {
      setError(err?.data?.message || 'Failed to create department.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add Department</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Department Name <span className="text-red-500">*</span></label>
            <input
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Computer Science"
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-400 transition"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || isLoading}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors">
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DepartmentPanel = ({ batch, onSelect, onBack }) => {
  const [addOpen, setAddOpen] = useState(false);
  const { data: departments = [], isLoading } = useGetDepartmentsQuery();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete department "${name}"? This cannot be undone.`)) return;
    try { await deleteDepartment(id).unwrap(); toast.success('Department deleted.'); }
    catch (err) { toast.error(err?.data?.message || 'Failed to delete department.'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-xs text-indigo-600 hover:underline">← Batches</button>
        <span className="text-gray-300">/</span>
        <h2 className="text-lg font-semibold text-gray-900">
          {batch.startYear}–{batch.endYear}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
            batch.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
          }`}>{batch.scheme}</span>
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Select a department to view its semesters.</p>
        <button
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
        >
          + Add Department
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : departments.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-4xl">🏛️</p>
          <p className="text-sm font-semibold text-gray-700">No departments yet</p>
          <p className="text-xs text-gray-400">Add a department to get started.</p>
          <button onClick={() => setAddOpen(true)}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
            + Add First Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition-colors group">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                <button
                  onClick={(e) => handleDelete(dept.id, dept.name, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded border border-red-100 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
              <SpecChips dept={dept} batch={batch} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}

      {addOpen && <AddDepartmentModal onClose={() => setAddOpen(false)} />}
    </div>
  );
};

export default DepartmentPanel;
