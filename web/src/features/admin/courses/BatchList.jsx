import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useDeleteBatchMutation,
} from './coursesAdminApi';

const SCHEMES = ['NEP', 'SEP'];
const cy = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => cy - 4 + i);

const SchemeBadge = ({ scheme }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
    scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
  }`}>{scheme}</span>
);

const AddBatchModal = ({ onClose }) => {
  const [scheme, setScheme] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [error, setError] = useState('');
  const [createBatch, { isLoading }] = useCreateBatchMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(endYear) <= Number(startYear)) { setError('End year must be after start year.'); return; }
    try {
      await createBatch({ startYear: Number(startYear), endYear: Number(endYear), scheme }).unwrap();
      toast.success('Batch created.');
      onClose();
    } catch (err) {
      setError(err?.data?.message || 'Failed to create batch.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Add Batch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Scheme *</p>
            <div className="grid grid-cols-2 gap-2">
              {SCHEMES.map((s) => (
                <button type="button" key={s} onClick={() => setScheme(s)}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    scheme === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Start Year *</label>
              <select value={startYear} onChange={(e) => setStartYear(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">— Year —</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">End Year *</label>
              <select value={endYear} onChange={(e) => setEndYear(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">— Year —</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={!scheme || !startYear || !endYear || isLoading}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BatchList = ({ onSelect }) => {
  const [addOpen, setAddOpen] = useState(false);
  const { data: batches = [], isLoading, error } = useGetBatchesQuery();
  const [deleteBatch] = useDeleteBatchMutation();

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this batch and all its class structure?')) return;
    try { await deleteBatch(id).unwrap(); toast.success('Batch deleted.'); }
    catch (err) { toast.error(err?.data?.message || 'Failed to delete batch.'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Select a batch to manage its courses.</p>
        <button onClick={() => setAddOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          + Add Batch
        </button>
      </div>

      {error && <p className="text-sm text-red-500">Failed to load batches.</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-4xl">🏫</p>
          <p className="text-sm font-semibold text-gray-700">No batches yet</p>
          <button onClick={() => setAddOpen(true)}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
            + Add First Batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => (
            <div key={b.id} onClick={() => onSelect(b)}
              className="relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-gray-900 font-mono">{b.startYear} – {b.endYear}</p>
                  <SchemeBadge scheme={b.scheme} />
                </div>
                <button onClick={(e) => handleDelete(b.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded border border-red-100 hover:bg-red-50">
                  Delete
                </button>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span><span className="font-bold text-gray-800">{b.totalDepartments}</span> dept{b.totalDepartments !== 1 ? 's' : ''}</span>
                <span><span className="font-bold text-gray-800">{b.totalCourses}</span> course{b.totalCourses !== 1 ? 's' : ''}</span>
              </div>
              <div className="absolute bottom-3 right-4 text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && <AddBatchModal onClose={() => setAddOpen(false)} />}
    </div>
  );
};

export default BatchList;
