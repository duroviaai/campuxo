import { useGetHodFacultyQuery } from '../state/hodApi';

const HodFacultyPage = () => {
  const { data: faculty = [], isLoading, isError } = useGetHodFacultyQuery();

  if (isLoading) return <p className="text-sm text-gray-500">Loading faculty...</p>;
  if (isError)   return <p className="text-sm text-red-500">Failed to load faculty.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Department Faculty</h1>
      {faculty.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl">👨🏫</p>
          <p className="text-sm font-semibold text-gray-700 mt-2">No faculty in your department.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Faculty ID</th>
                <th className="px-6 py-3 text-left">Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faculty.map((f, i) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{f.fullName}</td>
                  <td className="px-6 py-4 text-gray-500">{f.email}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{f.facultyId ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{f.courseCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HodFacultyPage;
