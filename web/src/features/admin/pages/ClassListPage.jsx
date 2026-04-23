import { useState } from 'react';
import { useGetAllClassesQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation } from '../../student/state/studentApi';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';
const DEPARTMENTS = ['BCA', 'BSc', 'BCom', 'BA'];
const EMPTY = { name: '', year: '' };

const ClassModal = ({ initial, onSave, onClose }) => {
  const [form, setForm]             = useState(initial ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSave({ name: form.name, year: Number(form.year) });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.data?.message || 'Failed to save class.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900">{initial ? 'Edit Class' : 'Add Class'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Department<span className="text-red-500 ml-0.5">*</span>
            </label>
            <select name="name" required value={form.name} onChange={handleChange} className={inputCls}>
              <option value="">— Select department —</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Year<span className="text-red-500 ml-0.5">*</span>
            </label>
            <select name="year" required value={form.year} onChange={handleChange} className={inputCls}>
              <option value="">— Select year —</option>
              {[1, 2, 3].map((y) => (
                <option key={y} value={y}>{y === 1 ? '1st' : y === 2 ? '2nd' : '3rd'} Year</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClassListPage = () => {
  const [modal, setModal] = useState(null);

  const { data: classes = [], isLoading: loading, error } = useGetAllClassesQuery();
  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  const handleSave = async (data) => {
    if (modal === 'create') await createClass(data).unwrap();
    else await updateClass({ id: modal.id, ...data }).unwrap();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class? This may affect enrolled students and courses.')) return;
    try { await deleteClass(id).unwrap(); }
    catch { alert('Failed to delete class.'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Create classes first, then assign courses to them under Departments.</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          + Add Class
        </button>
      </div>

      {error && <p className="text-sm text-red-500">Failed to load classes.</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : classes.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-4xl">🏫</p>
            <p className="text-sm font-semibold text-gray-700">No classes yet</p>
            <p className="text-xs text-gray-400">Add a class (e.g. BCA · 1st Year) to get started.<br />Once created, you can assign courses to it under Departments.</p>
            <button
              onClick={() => setModal('create')}
              className="mt-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              + Add First Class
            </button>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                {['#', 'Department', 'Year', 'Display Name', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-gray-600">{c.year === 1 ? '1st' : c.year === 2 ? '2nd' : '3rd'} Year</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{c.displayName}</td>
                  <td className="px-5 py-3 flex gap-2">
                    <button
                      onClick={() => setModal(c)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ClassModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default ClassListPage;
