const AttendanceFilters = ({ courseList, courseId, date, onCourseChange, onDateChange }) => (
  <div className="flex items-center gap-3">
    <select
      value={courseId}
      onChange={(e) => onCourseChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
    >
      <option value="">Select course</option>
      {courseList.map((c) => (
        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
      ))}
    </select>
    <input
      type="date"
      value={date}
      onChange={(e) => onDateChange(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
    />
  </div>
);

export default AttendanceFilters;
