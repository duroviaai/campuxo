import useCourseForm from '../hooks/useCourseForm';
import StudentMultiSelect from './StudentMultiSelect';
import { EMPTY_COURSE_FORM } from '../utils/courseHelpers';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white';

const CourseForm = ({ initialData = EMPTY_COURSE_FORM, onSubmit }) => {
  const {
    form, submitting, error,
    facultyList, studentList,
    handleChange, handleStudentIds, handleSubmit,
  } = useCourseForm(initialData, onSubmit);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600">Course Name<span className="text-red-500 ml-0.5">*</span></label>
        <input name="name" required value={form.name} onChange={handleChange} className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600">Course Code<span className="text-red-500 ml-0.5">*</span></label>
        <input name="code" required value={form.code} onChange={handleChange} className={inputCls} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600">Faculty<span className="text-red-500 ml-0.5">*</span></label>
        <select name="facultyId" required value={form.facultyId} onChange={handleChange} className={`${inputCls} text-gray-700`}>
          <option value="">Select faculty</option>
          {facultyList.map((f) => (
            <option key={f.id} value={f.id}>{f.name || f.fullName || f.email}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-600">Students</label>
        <StudentMultiSelect
          students={studentList}
          selectedStudents={form.studentIds}
          setSelectedStudents={handleStudentIds}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {submitting ? 'Saving...' : 'Save Course'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
