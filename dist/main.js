"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ======================== ENUMS ========================
/**
 * Статус студента
 */
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["Active"] = "Active";
    StudentStatus["Academic_Leave"] = "Academic_Leave";
    StudentStatus["Graduated"] = "Graduated";
    StudentStatus["Expelled"] = "Expelled";
})(StudentStatus || (StudentStatus = {}));
/**
 * Тип курсу
 */
var CourseType;
(function (CourseType) {
    CourseType["Mandatory"] = "Mandatory";
    CourseType["Optional"] = "Optional";
    CourseType["Special"] = "Special";
})(CourseType || (CourseType = {}));
/**
 * Семестр навчання
 */
var Semester;
(function (Semester) {
    Semester["First"] = "First";
    Semester["Second"] = "Second";
})(Semester || (Semester = {}));
/**
 * Оцінки
 */
var GradeValue;
(function (GradeValue) {
    GradeValue[GradeValue["Excellent"] = 5] = "Excellent";
    GradeValue[GradeValue["Good"] = 4] = "Good";
    GradeValue[GradeValue["Satisfactory"] = 3] = "Satisfactory";
    GradeValue[GradeValue["Unsatisfactory"] = 2] = "Unsatisfactory";
})(GradeValue || (GradeValue = {}));
/**
 * Факультети університету
 */
var Faculty;
(function (Faculty) {
    Faculty["Computer_Science"] = "Computer_Science";
    Faculty["Economics"] = "Economics";
    Faculty["Law"] = "Law";
    Faculty["Engineering"] = "Engineering";
})(Faculty || (Faculty = {}));
// ======================== UNIVERSITY MANAGEMENT SYSTEM ========================
/**
 * Клас системи управління університетом
 */
class UniversityManagementSystem {
    students = [];
    courses = [];
    grades = [];
    studentIdCounter = 1;
    courseIdCounter = 1;
    // =================== STUDENT METHODS ===================
    /**
     * Додати студента до системи
     */
    enrollStudent(student) {
        const newStudent = { ...student, id: this.studentIdCounter++ };
        this.students.push(newStudent);
        return newStudent;
    }
    /**
     * Оновити статус студента
     */
    updateStudentStatus(studentId, newStatus) {
        const student = this.students.find(s => s.id === studentId);
        if (!student)
            throw new Error("Студент не знайдений");
        // Валідація: не можна перевести Expelled або Graduated назад в Active
        if ((student.status === StudentStatus.Expelled || student.status === StudentStatus.Graduated)
            && newStatus === StudentStatus.Active) {
            throw new Error("Неможливо змінити статус Expelled або Graduated на Active");
        }
        student.status = newStatus;
    }
    /**
     * Отримати студентів певного факультету
     */
    getStudentsByFaculty(faculty) {
        return this.students.filter(s => s.faculty === faculty);
    }
    // =================== COURSE METHODS ===================
    /**
     * Додати курс
     */
    addCourse(course) {
        const newCourse = { ...course, id: this.courseIdCounter++ };
        this.courses.push(newCourse);
        return newCourse;
    }
    /**
     * Показати доступні курси для факультету та семестру
     */
    getAvailableCourses(faculty, semester) {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }
    /**
     * Зареєструвати студента на курс
     */
    registerForCourse(studentId, courseId) {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student)
            throw new Error("Студент не знайдений");
        if (!course)
            throw new Error("Курс не знайдений");
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
    // =================== GRADING METHODS ===================
    /**
     * Встановити оцінку студенту за курс
     */
    setGrade(studentId, courseId, grade) {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student)
            throw new Error("Студент не знайдений");
        if (!course)
            throw new Error("Курс не знайдений");
        // Перевірка, чи студент зареєстрований
        const gradeRecord = this.grades.find(g => g.studentId === studentId && g.courseId === courseId);
        if (!gradeRecord)
            throw new Error("Студент не зареєстрований на курс");
        gradeRecord.grade = grade;
        gradeRecord.date = new Date();
    }
    /**
     * Отримати всі оцінки студента
     */
    getStudentGrades(studentId) {
        return this.grades.filter(g => g.studentId === studentId);
    }
    /**
     * Розрахувати середню оцінку студента
     */
    calculateAverageGrade(studentId) {
        const studentGrades = this.getStudentGrades(studentId);
        if (studentGrades.length === 0)
            return 0;
        const sum = studentGrades.reduce((acc, g) => acc + g.grade, 0);
        return sum / studentGrades.length;
    }
    /**
     * Отримати список відмінників по факультету
     */
    getTopStudentsByFaculty(faculty) {
        const students = this.getStudentsByFaculty(faculty);
        return students.filter(s => this.calculateAverageGrade(s.id) >= GradeValue.Excellent);
    }
}
// ======================== EXAMPLE USAGE ========================
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
//# sourceMappingURL=main.js.map