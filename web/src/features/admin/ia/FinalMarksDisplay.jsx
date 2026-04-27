import React, { useState, useEffect } from 'react';
import { iaApi } from './finalMarksApi';

const FinalMarksDisplay = ({ classStructureId, courseId }) => {
  const [finalMarks, setFinalMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinalMarks();
  }, [classStructureId, courseId]);

  const fetchFinalMarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await iaApi.getFinalMarks(classStructureId, courseId);
      setFinalMarks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch final marks');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFinalMarks = async () => {
    setLoading(true);
    setError(null);
    try {
      await iaApi.calculateFinalMarks(classStructureId, courseId);
      await fetchFinalMarks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate final marks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Final Marks (Top 2 Average)</h2>
        <button
          onClick={handleCalculateFinalMarks}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Calculate Final Marks
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">Student Name</th>
              <th className="border p-3 text-center">Reg. No.</th>
              <th className="border p-3 text-center">IA1</th>
              <th className="border p-3 text-center">IA2</th>
              <th className="border p-3 text-center">IA3</th>
              <th className="border p-3 text-center">Top 2 Avg</th>
              <th className="border p-3 text-center">Final Marks</th>
              <th className="border p-3 text-center">Calculated Date</th>
            </tr>
          </thead>
          <tbody>
            {finalMarks.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="border p-3">{student.studentName}</td>
                <td className="border p-3 text-center">{student.registrationNumber}</td>
                <td className="border p-3 text-center">{student.ia1Marks?.toFixed(2) || '-'}</td>
                <td className="border p-3 text-center">{student.ia2Marks?.toFixed(2) || '-'}</td>
                <td className="border p-3 text-center">{student.ia3Marks?.toFixed(2) || '-'}</td>
                <td className="border p-3 text-center font-semibold text-blue-600">
                  {student.topTwoAverage?.toFixed(2) || '-'}
                </td>
                <td className="border p-3 text-center font-bold text-green-600">
                  {student.finalMarks?.toFixed(2) || '-'}
                </td>
                <td className="border p-3 text-center text-sm">
                  {student.calculatedDate || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {finalMarks.length === 0 && !error && (
        <div className="text-center p-8 text-gray-500">No final marks data available</div>
      )}
    </div>
  );
};

export default FinalMarksDisplay;
