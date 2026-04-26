import { useState } from 'react';
import { useGetDepartmentsQuery } from '../../admin/courses/coursesAdminApi';
import { useGetFacultyQuery } from '../state/facultyApi';

// Pre-fetch faculty counts per dept for the cards
const useDeptCounts = (depts) => {
  const { data } = useGetFacultyQuery({ page: 0, size: 200, sort: 'id' });
  const all = data?.content ?? data ?? [];
  const counts = {};
  depts.forEach((d) => {
    const members = all.filter((f) => f.department === d.name);
    counts[d.name] = {
      total: members.length,
      hod: members.find((f) => f.hod) ?? null,
    };
  });
  return counts;
};

const DeptList = ({ onSelect }) => {
  const { data: departments = [], isLoading, error } = useGetDepartmentsQuery();
  const counts = useDeptCounts(departments);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Faculty</h1>
        <p className="text-xs text-gray-400 mt-0.5">Select a department to manage its faculty.</p>
      </div>

      {error && <p className="text-sm text-red-500">Failed to load departments.</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : departments.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-4xl">🏛️</p>
          <p className="text-sm font-semibold text-gray-700">No departments configured</p>
          <p className="text-xs text-gray-400">Add departments in the Courses section first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const { total, hod } = counts[dept.name] ?? { total: 0, hod: null };
            return (
              <div key={dept.id} onClick={() => onSelect(dept)}
                className="relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-lg font-bold text-gray-900">{dept.name}</p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span><span className="font-bold text-gray-800">{total}</span> member{total !== 1 ? 's' : ''}</span>
                  {hod && (
                    <span className="text-violet-600 font-semibold truncate max-w-[120px]">
                      HOD: {hod.fullName || hod.firstName}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-4 text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeptList;
