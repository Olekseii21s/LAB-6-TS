// ======================== ENUMS ========================
/**
 Статус студента
 */
enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled"
}

/**
 Тип курсу
 */
enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special"
}

/**
 * Семестр навчання
 */
enum Semester {
    First = "First",
    Second = "Second"
}

/**
 Оцінки
 */
enum GradeValue {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}


/**
 * Факультети університету
 */
enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering"
}


/**
 Інтерфейс студента
 */
interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

/**
Інтерфейс курсу
 */
interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

/**
 * Інтерфейс оцінки
 */
interface Grade {
    studentId: number;
    courseId: number;
    grade: GradeValue;
    date: Date;
    semester: Semester;
}


/**
 * Клас системи управління університетом
 */
class UniversityManagementSystem {
    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: Grade[] = [];
    private studentIdCounter: number = 1;
    private courseIdCounter: number = 1;


    /**
     * Додати студента до системи
     */
    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent: Student = { ...student, id: this.studentIdCounter++ };
        this.students.push(newStudent);
        return newStudent;
    }

    /**
     Оновити статус студента
     */
    updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);
        if (!student) throw new Error("Студент не знайдений");

        // Валідація: не можна перевести Expelled або Graduated назад в Active
        if ((student.status === StudentStatus.Expelled || student.status === StudentStatus.Graduated)
            && newStatus === StudentStatus.Active) {
            throw new Error("Неможливо змінити статус Expelled або Graduated на Active");
        }

        student.status = newStatus;
    }

    /**
     Отримати студентів певного факультету
     */
    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    // =================== COURSE METHODS ===================
    /**
     * Додати курс
     */
    addCourse(course: Omit<Course, "id">): Course {
        const newCourse: Course = { ...course, id: this.courseIdCounter++ };
        this.courses.push(newCourse);
        return newCourse;
    }

    /**
      Показати доступні курси для факультету та семестру
     */
    getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }

    /**
      Зареєструвати студента на курс
     */
    registerForCourse(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student) throw new Error("Студент не знайдений");
        if (!course) throw new Error("Курс не знайдений");

        // Перевірка факультету
        if (student.faculty !== course.faculty) {
            throw new Error("Студент не може записатися на курс іншого факультету");
        }

        // Перевірка кількості студентів
        const studentsInCourse = this.grades.filter(g => g.courseId === courseId)
            .map(g => g.studentId);
        if (studentsInCourse.length >= course.maxStudents) {
            throw new Error("Курс переповнений");
        }

        // Якщо студент ще не має оцінки, створюємо placeholder з Unsatisfactory
        if (!this.grades.find(g => g.studentId === studentId && g.courseId === courseId)) {
            this.grades.push({
                studentId,
                courseId,
                grade: GradeValue.Unsatisfactory,
                date: new Date(),
                semester: course.semester
            });
        }
    }

    /**
     * Встановити оцінку студенту за курс
     */
    setGrade(studentId: number, courseId: number, grade: GradeValue): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student) throw new Error("Студент не знайдений");
        if (!course) throw new Error("Курс не знайдений");

        // Перевірка, чи студент зареєстрований
        const gradeRecord = this.grades.find(g => g.studentId === studentId && g.courseId === courseId);
        if (!gradeRecord) throw new Error("Студент не зареєстрований на курс");

        gradeRecord.grade = grade;
        gradeRecord.date = new Date();
    }

    /**
     * Отримати всі оцінки студента
     */
    getStudentGrades(studentId: number): Grade[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    /**
     * Розрахувати середню оцінку студента
     */
    calculateAverageGrade(studentId: number): number {
        const studentGrades = this.getStudentGrades(studentId);
        if (studentGrades.length === 0) return 0;

        const sum = studentGrades.reduce((acc, g) => acc + g.grade, 0);
        return sum / studentGrades.length;
    }

    /**
     * Отримати список відмінників по факультету
     */
    getTopStudentsByFaculty(faculty: Faculty): Student[] {
        const students = this.getStudentsByFaculty(faculty);
        return students.filter(s => this.calculateAverageGrade(s.id) >= GradeValue.Excellent);
    }
}


const ums = new UniversityManagementSystem();

// Додаємо курс
ums.addCourse({ name: "TypeScript 101", type: CourseType.Mandatory, credits: 5, semester: Semester.First, faculty: Faculty.Computer_Science, maxStudents: 2 });
ums.addCourse({ name: "Economics Basics", type: CourseType.Mandatory, credits: 5, semester: Semester.First, faculty: Faculty.Economics, maxStudents: 2 });

// Реєструємо студентів
const student1 = ums.enrollStudent({ fullName: "Ivan Ivanov", faculty: Faculty.Computer_Science, year: 1, status: StudentStatus.Active, enrollmentDate: new Date(), groupNumber: "CS101" });
const student2 = ums.enrollStudent({ fullName: "Petro Petrov", faculty: Faculty.Computer_Science, year: 1, status: StudentStatus.Active, enrollmentDate: new Date(), groupNumber: "CS101" });

// Реєстрація на курс
ums.registerForCourse(student1.id, 1);
ums.registerForCourse(student2.id, 1);

// Встановлення оцінок
ums.setGrade(student1.id, 1, GradeValue.Excellent);
ums.setGrade(student2.id, 1, GradeValue.Good);

// Середня оцінка
console.log(ums.calculateAverageGrade(student1.id)); // 5
console.log(ums.getTopStudentsByFaculty(Faculty.Computer_Science)); // Відмінники

