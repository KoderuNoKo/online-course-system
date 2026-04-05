CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,
  salt VARCHAR(64) NOT NULL,
  role ENUM('STUDENT', 'AAO', 'ADMIN') NOT NULL,
  full_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NULL UNIQUE,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(128) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  last_activity_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX sessions_user_id_idx (user_id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  start_date DATETIME(3) NOT NULL,
  end_date DATETIME(3) NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(191) NOT NULL,
  department VARCHAR(100) NOT NULL,
  lecturer VARCHAR(100) NOT NULL,
  classroom VARCHAR(50) NOT NULL,
  schedule VARCHAR(100) NOT NULL,
  max_capacity INT NOT NULL,
  enrolled_count INT NOT NULL DEFAULT 0,
  semester_id INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY courses_course_code_semester_id_key (course_code, semester_id),
  INDEX courses_semester_id_is_active_deleted_at_idx (semester_id, is_active, deleted_at),
  CONSTRAINT courses_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE registration_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester_id INT NOT NULL,
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
  submitted_at DATETIME(3) NULL,
  decided_at DATETIME(3) NULL,
  decided_by INT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY registration_forms_student_id_semester_id_key (student_id, semester_id),
  INDEX registration_forms_status_submitted_at_idx (status, submitted_at),
  CONSTRAINT registration_forms_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT registration_forms_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES semesters(id),
  CONSTRAINT registration_forms_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES users(id)
);

CREATE TABLE registration_form_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_form_id INT NOT NULL,
  course_id INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY registration_form_items_registration_form_id_course_id_key (registration_form_id, course_id),
  CONSTRAINT registration_form_items_registration_form_id_fkey FOREIGN KEY (registration_form_id) REFERENCES registration_forms(id) ON DELETE CASCADE,
  CONSTRAINT registration_form_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  semester_id INT NOT NULL,
  registration_form_id INT NOT NULL,
  enrolled_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY enrollments_student_id_course_id_semester_id_key (student_id, course_id, semester_id),
  INDEX enrollments_course_id_semester_id_idx (course_id, semester_id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT enrollments_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES semesters(id),
  CONSTRAINT enrollments_registration_form_id_fkey FOREIGN KEY (registration_form_id) REFERENCES registration_forms(id)
);
