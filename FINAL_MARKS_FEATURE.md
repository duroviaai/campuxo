# Final Marks Calculation Feature

## Overview
This feature automatically calculates final marks for students based on their top 2 Internal Assessment (IA) scores out of IA1, IA2, and IA3.

## How It Works

### Calculation Logic
1. **Collect all IA marks**: IA1, IA2, IA3 for each student
2. **Select top 2**: Pick the 2 highest marks
3. **Calculate average**: Average of the top 2 marks
4. **Store result**: Save as final marks in database

### Example
- Student A: IA1=45, IA2=48, IA3=42
- Top 2: 48 + 45 = 93
- Final Marks: 93 / 2 = **46.50**

## Database Changes

### New Columns in `internal_assessments` table
- `final_marks` (DECIMAL 5,2): Stores the calculated final marks
- `final_marks_calculated_date` (TIMESTAMP): When the calculation was performed

## API Endpoints

### 1. Get All IA Marks (with final marks)
```
GET /api/v1/ia?classStructureId={id}&courseId={id}
```
**Response**: List of StudentIAResponseDTO with individual IA marks and final marks

### 2. Calculate Final Marks for All Students
```
POST /api/v1/ia/calculate-final-marks?classStructureId={id}&courseId={id}
```
**Purpose**: Triggers calculation and stores final marks in database
**Response**: 204 No Content

### 3. Get Final Marks Details
```
GET /api/v1/ia/final-marks?classStructureId={id}&courseId={id}
```
**Response**: List of StudentFinalMarksResponseDTO with:
- Individual IA marks (IA1, IA2, IA3)
- Top 2 average
- Final marks
- Calculation date

## DTOs

### StudentFinalMarksResponseDTO
```java
{
  "studentId": 1,
  "studentName": "John Doe",
  "registrationNumber": "REG001",
  "ia1Marks": 45.00,
  "ia2Marks": 48.00,
  "ia3Marks": 42.00,
  "topTwoAverage": 46.50,
  "finalMarks": 46.50,
  "calculatedDate": "2024-01-15"
}
```

### StudentIAResponseDTO (Updated)
```java
{
  "studentId": 1,
  "studentName": "John Doe",
  "registrationNumber": "REG001",
  "marks": {
    "1": 45.00,
    "2": 48.00,
    "3": 42.00
  },
  "maxMarks": {
    "1": 50.00,
    "2": 50.00,
    "3": 50.00
  },
  "dates": {
    "1": "2024-01-10",
    "2": "2024-01-12",
    "3": "2024-01-14"
  },
  "finalMarks": 46.50,
  "finalMarksCalculatedDate": "2024-01-15"
}
```

## Frontend Usage

### Import Component
```jsx
import FinalMarksDisplay from './features/admin/ia/FinalMarksDisplay';
```

### Use in Page
```jsx
<FinalMarksDisplay classStructureId={1} courseId={2} />
```

### Features
- Display all students with their IA marks
- Show top 2 average calculation
- Display final marks prominently
- Calculate button to trigger calculation
- Auto-refresh after calculation
- Error handling and loading states

## Workflow

1. **Admin enters IA marks** for all 3 assessments
2. **Admin clicks "Calculate Final Marks"** button
3. **System calculates** top 2 average for each student
4. **Results stored** in database with timestamp
5. **Display updated** with final marks for all students

## Notes

- Final marks are only calculated if student has at least 2 IA marks
- Calculation uses HALF_UP rounding mode (standard rounding)
- Final marks are stored per student per course per class structure
- Calculation date is recorded for audit trail
- All calculations are transactional for data consistency
