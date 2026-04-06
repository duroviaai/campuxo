const StudentMultiSelect = ({ students = [], selectedStudents = [], setSelectedStudents }) => {
  const toggle = (id) => {
    const next = selectedStudents.includes(id)
      ? selectedStudents.filter((s) => s !== id)
      : [...selectedStudents, id];
    setSelectedStudents(next);
  };

  if (!students.length) return null;

  return (
    <div className="col-span-2">
      <p className="text-xs text-gray-500 mb-1.5">Enroll Students</p>
      <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100">
        {students.map((s) => (
          <label key={s.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedStudents.includes(s.id)}
              onChange={() => toggle(s.id)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-gray-700">{s.name || s.fullName || s.email}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StudentMultiSelect;
