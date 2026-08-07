declare module '@supabase/supabase-js' {
  export function createClient(supabaseUrl: string, supabaseKey: string): any;

  export type Role = 'administrator' | 'instructor' | 'student';
  export type UserStatus = 'active' | 'inactive';

  export type Profile = {
    id: string;
    email: string;
    password_plain: string;
    first_name: string;
    last_name: string;
    role: Role;
    status: UserStatus;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  };

  export type Student = {
    id: string;
    profile_id: string;
    student_no: string;
    course?: string;
    year_level?: number;
    section_label?: string;
    created_at: string;
  };

  export type Instructor = {
    id: string;
    profile_id: string;
    employee_no: string;
    department?: string;
    created_at: string;
  };
}

