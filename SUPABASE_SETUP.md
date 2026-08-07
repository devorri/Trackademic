# Supabase Setup Guide

## Step 1: Create the Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql` from this project
5. Paste into the SQL editor
6. Click **Run**

This will create all tables, enums, and enable Row Level Security.

## Step 2: Verify Tables in Supabase

After running the SQL:
- Go to **Table Editor** in Supabase
- You should see these tables:
  - `profiles`
  - `instructors`
  - `students`
  - `subjects`
  - `sections`
  - `classes`
  - `class_students`
  - `grade_components`
  - `grades`
  - `grade_summaries`
  - `predictions`
  - `reports`
  - `activity_logs`

## Step 3: Migrate Existing Data (Optional)

If you want to migrate data from your `initialData.ts`:

```typescript
import { dbProfiles, dbStudents, dbSubjects, dbClasses } from '@/utils/db'
import { initialUsers, initialStudents, initialSubjects, initialClasses } from '@/data/initialData'

// This is pseudo-code - you'll need to adapt to your exact structure
async function migrateData() {
  // 1. Create profiles for users
  for (const user of initialUsers) {
    await dbProfiles.create({
      email: user.email,
      password_plain: user.password || '',
      first_name: user.name.split(' ')[0],
      last_name: user.name.split(' ')[1] || '',
      role: user.role,
      status: user.status,
    })
  }

  // 2. Create subjects
  for (const subject of initialSubjects) {
    await dbSubjects.create({
      code: subject.code,
      title: subject.title,
      units: subject.units,
    })
  }

  // 3. Do the same for students, classes, etc.
}
```

## Step 4: Update Frontend to Use Database

The `src/utils/db.ts` file provides a complete API for database operations:

```typescript
import { dbStudents, dbClasses, dbGrades } from '@/utils/db'

// Get all students
const students = await dbStudents.getAll()

// Create a new student
const newStudent = await dbStudents.create({
  profile_id: profileId,
  student_no: '2024001',
  course: 'CS',
})

// Update a student
await dbStudents.update(studentId, { course: 'IT' })

// Delete a student
await dbStudents.delete(studentId)
```

## Step 5: Update DataContext

You'll need to update `src/context/DataContext.tsx` to:
1. Call database functions instead of using `initialData`
2. Handle async operations (currently it's all synchronous)
3. Add loading/error states

Example pattern:

```typescript
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dbStudents.getAll()
        setStudents(data)
      } catch (error) {
        console.error('Failed to load students:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSaveStudent = async (formData: Omit<Student, 'id'>) => {
    try {
      await dbStudents.create(formData)
      // Reload data
      const updated = await dbStudents.getAll()
      setStudents(updated)
    } catch (error) {
      console.error('Failed to save student:', error)
    }
  }

  // ... rest of context
}
```

## Database API Reference

### Available Services

- `dbProfiles` - User profiles
- `dbInstructors` - Instructor records
- `dbStudents` - Student records
- `dbSubjects` - Course subjects
- `dbSections` - Class sections
- `dbClasses` - Classes
- `dbGradeComponents` - Grade components (quizzes, exams, etc.)
- `dbGrades` - Individual grades
- `dbGradeSummaries` - Computed grade summaries
- `dbReports` - Generated reports

### Common Operations

All services follow this pattern:

```typescript
getAll()                              // Get all records
getById(id: string)                   // Get by ID
create(data: Omit<T, 'id'>)         // Create new
update(id: string, updates: Partial<T>)  // Update
delete(id: string)                    // Delete
```

## Important Notes

⚠️ **UUID vs Numeric IDs**
- The database uses UUIDs (strings) for all IDs
- Your old `initialData.ts` uses numeric IDs
- You'll need to migrate this data or update the schema

⚠️ **Async Operations**
- Database calls are now async/await
- You'll need to update all components that interact with data
- Add loading states and error handling

⚠️ **Password Storage**
- Currently storing passwords in plain text (⚠️ NOT SECURE)
- Consider implementing proper auth with Supabase Auth
- Or at minimum, hash passwords before storing

## Next Steps

1. Run the SQL schema in Supabase
2. Verify tables are created
3. Start updating components to use `db.ts` functions
4. Remove dependency on `initialData.ts`
5. Test thoroughly!
