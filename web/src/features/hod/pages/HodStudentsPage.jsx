import { useState } from 'react';
import { useGetHodStudentsQuery } from '../state/hodApi';

const HodStudentsPage = () => {
  const { data: students = [], isLoading, isError } = useGetHodStudentsQuery();
  const [search, setSearch] = useState('');

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.fullName?.toLowerCase().includes(q) || s.registrationNumber?.toLowerCase().includes(q);
  });

  if (isLoading) return <p className="text-sm text-gray-500">Loading students...</p>;
  if (isError)   return <p className="text-sm text-red-500">Failed to load students.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Department Students</h1>
        <input
          type="text"
          placeholder="Search by name or reg no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl">🎓</p>
          <p className="text-sm font-semibold text-gray-700 mt-2">No students found.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Reg No.</th>
                <th className="px-6 py-3 text-left">Class</th>
                <th className="px-6 py-3 text-left">Year</th>
                <th className="px-6 py-3 text-left">Scheme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{s.fullName}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{s.registrationNumber ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{s.classBatchDisplayName ?? s.classBatchName ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{s.yearOfStudy ?? '—'}</td>
                  <td className="px-6 py-4">
                    {s.scheme ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.scheme === 'NEP' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {s.scheme}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HodStudentsPage;
