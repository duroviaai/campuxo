import { useState, useCallback } from 'react';
import { getAttendanceByCourseAndDate, markAttendanceBatch } from '../services/attendanceService';
import { getCourses } from '../../course/services/courseService';
import { getCourseById } from '../../course/services/courseService';

const useAttendance = () => {
  const [courseId, setCourseId]   = useState('');
  const [date, setDate]           = useState('');
  const [students, setStudents]   = useState([]);   // [{ id, name, registrationNumber, status }]
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);

  // Load course list once
  const loadCourses = useCallback(() => {
    getCourses({ size: 200 }).then((d) => setCourseList(d.content ?? d)).catch(() => {});
  }, []);

  const fetchAttendance = useCallback(async (cId, d) => {
    if (!cId || !d) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Get enrolled students from course
      const course = await getCourseById(cId);
      const enrolled = course.students ?? [];

      // Get existing attendance records for that day
      const existing = await getAttendanceByCourseAndDate(cId, d);
      const existingMap = Object.fromEntries(existing.map((r) => [r.studentId ?? r.id, r.status]));

      setStudents(enrolled.map((s) => ({
        id:                 s.id,
        name:               s.fullName || `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email,
        registrationNumber: s.registrationNumber || s.email || '—',
        status:             existingMap[s.id] ?? 'PRESENT',
      })));
    } catch {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = (studentId, status) => {
    setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, status } : s));
  };

  const submitAttendance = async () => {
    if (!courseId || !date || !students.length) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await markAttendanceBatch(
        students.map((s) => ({ studentId: s.id, courseId: Number(courseId), date, status: s.status }))
      );
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    courseId, setCourseId,
    date, setDate,
    students, courseList,
    loading, submitting, error, success,
    loadCourses, fetchAttendance, updateStatus, submitAttendance,
  };
};

export default useAttendance;
