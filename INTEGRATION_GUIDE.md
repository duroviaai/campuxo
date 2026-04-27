# Integration Guide - Final Marks Feature

## Backend Integration Steps

### 1. Run Database Migration
```bash
cd api/collegeportal
mvn flyway:migrate
```
This will create the new columns in the `internal_assessments` table.

### 2. Verify Entity Updates
The `InternalAssessment` entity now includes:
- `finalMarks` field
- `finalMarksCalculatedDate` field

### 3. Test API Endpoints

#### Calculate Final Marks
```bash
curl -X POST "http://localhost:8080/api/v1/ia/calculate-final-marks?classStructureId=1&courseId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Final Marks
```bash
curl -X GET "http://localhost:8080/api/v1/ia/final-marks?classStructureId=1&courseId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration Steps

### 1. Add Component to Admin IA Page
Update `AdminIAPage.jsx`:

```jsx
import FinalMarksDisplay from './FinalMarksDisplay';

export default function AdminIAPage() {
  const [classStructureId, setClassStructureId] = useState(null);
  const [courseId, setCourseId] = useState(null);

  return (
    <div className="space-y-6">
      {/* Existing IA marks entry form */}
      
      {/* Add final marks display */}
      {classStructureId && courseId && (
        <FinalMarksDisplay 
          classStructureId={classStructureId} 
          courseId={courseId} 
        />
      )}
    </div>
  );
}
```

### 2. Update AdminIAPage.jsx
```jsx
import FinalMarksDisplay from './FinalMarksDisplay';

// In your component JSX:
<div className="mt-8">
  <FinalMarksDisplay 
    classStructureId={selectedClassStructureId} 
    courseId={selectedCourseId} 
  />
</div>
```

### 3. Install Dependencies (if needed)
```bash
cd web
npm install
```

## Testing Checklist

### Backend Tests
- [ ] Database migration runs successfully
- [ ] New columns exist in `internal_assessments` table
- [ ] POST `/api/v1/ia/calculate-final-marks` returns 204
- [ ] GET `/api/v1/ia/final-marks` returns correct data
- [ ] Final marks calculation is correct (top 2 average)
- [ ] Calculation date is recorded

### Frontend Tests
- [ ] FinalMarksDisplay component renders
- [ ] "Calculate Final Marks" button works
- [ ] Table displays all students
- [ ] IA1, IA2, IA3 marks display correctly
- [ ] Top 2 average calculates correctly
- [ ] Final marks display prominently
- [ ] Error messages show on failure
- [ ] Loading state displays during calculation

### Data Validation
- [ ] Students with < 2 IA marks show "-"
- [ ] Marks are rounded to 2 decimal places
- [ ] Calculation date updates after calculation
- [ ] Multiple calculations don't create duplicates

## Troubleshooting

### Issue: Migration fails
**Solution**: Check if columns already exist, or rollback and retry

### Issue: Final marks not calculating
**Solution**: Ensure students have at least 2 IA marks entered

### Issue: Frontend component not displaying
**Solution**: Verify classStructureId and courseId are passed correctly

### Issue: API returns 403 Forbidden
**Solution**: Ensure user has ADMIN role

## Performance Considerations

- Calculation is transactional and atomic
- Batch processing for multiple students
- Indexed queries on student_id, course_id, class_structure_id
- Final marks cached in database to avoid recalculation

## Future Enhancements

1. **Scheduled Calculation**: Auto-calculate at semester end
2. **Weighted Average**: Support different IA weightages
3. **Export**: Export final marks to Excel/PDF
4. **History**: Track calculation history and changes
5. **Notifications**: Notify students of final marks
