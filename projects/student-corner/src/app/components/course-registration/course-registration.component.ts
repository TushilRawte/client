import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators,FormArray, AbstractControl } from '@angular/forms';
import { HttpService,AlertService, PrintService} from 'shared';



@Component({
  selector: 'app-course-registration',
  standalone: false,
  templateUrl: './course-registration.component.html',
  styleUrl: './course-registration.component.scss'
})
export class CourseRegistrationComponent {

  selectedCourses: any[] = [];
  courseRegistrationForm!: FormGroup
  acadmcSesnList: any;
  collegeList: any;
  degreeProgrammeList: any;
  allCourses: any;
  semesterList: any;
  courseListForReg: any;
  otherDeptcourseListForReg: any;
   
  constructor(private snackBar: MatSnackBar,private fb : FormBuilder,private HTTP : HttpService) {}

  ngOnInit() {
    this.getAcademicSession();
    this.getCollegeData();
    this.getDegreeProgramme();
    this.getallCourse();
    this.getSemester();
    this.mainforfun();
    this.getCourseForRegistration();
    this.getOtherDeptCourseForRegistration()
  }

    mainforfun() {
        this.courseRegistrationForm = this.fb.group({

        });
      }

      academicSessions = [
      { id: 23, value: '2023-2024' }
    ];
    year = [
      { id: 2, value: '2nd Year' }
    ];
    semester = [
      { id: 1, value: 'I Semester' }
    ];
    academicStanding = [
      { id: 1, value: 'Regular' }
    ];
    collges = [
      { id: 1, value: 'CARS Raipur' }
    ];
    academicDegreeProgram = [
      { id: 20, value: 'M.Sc.(Hort.) (Fruit Science)' }
    ];
      deanCommittee = [
      { id: 4, value: '4th dean committee' }
    ];



      getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1/',{},'academic').subscribe((result:any) => {
      console.log(result);
      this.acadmcSesnList = result.body.data;
    })
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList1/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.collegeList = result.body.data;
    })
  }

  
  getDegreeProgramme() {
    this.HTTP.getParam('/master/get/getDegreePrograamList/',{},'academic').subscribe((result:any) => {
      // console.log('DP',result);
      this.degreeProgrammeList = result.body.data;
    })
  }

    getallCourse() {
    this.HTTP.getParam('/master/get/getCourseList/',{},'academic').subscribe((result:any) => {
      // console.log(result);
      this.allCourses = result.body.data;
    })
  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.semesterList = result.body.data;
    })
  }

   getCourseForRegistration() {
   const params  = {
      Academic_Session_Id: this.academicSessions[0].id,
      Course_Year_Id: this.year[0].id,
      Semester_Id: this.semester[0].id,
      ue_id: 20222882
    }
    this.HTTP.getParam('/course/get/getCourseListForReg/',params ,'academic').subscribe((result:any) => {
      console.log('course list',result);
      this.courseListForReg = result.body.data;
    })
  }

     getOtherDeptCourseForRegistration() {
      const params  = {
      Academic_Session_Id: this.academicSessions[0].id,
      Course_Year_Id: this.year[0].id,
      Semester_Id: this.semester[0].id,
      ue_id: 20222882
    }
    this.HTTP.getParam('/course/get/getOtherCourseListForRegister/',params ,'academic').subscribe((result:any) => {
      console.log('other dept course list',result);
      this.otherDeptcourseListForReg = result.body.data;
    })
  }


  selectCourse(course: any) {
    if (this.selectedCourses.find(c => c.course_id === course.course_id)) {
      // Show popup
      this.snackBar.open('Course already selected', 'Close', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }
    this.selectedCourses.push(course);
  }

  removeCourse(courseId: number) {
    this.selectedCourses = this.selectedCourses.filter(c => c.course_id !== courseId);
  }


onSubmit() {
    if (this.selectedCourses.length === 0) {
    this.snackBar.open('Please select at least one course', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    return;
  }
  const payload = {
    academic_session_id: this.academicSessions[0].id,
    year_id: this.year[0].id,
    semester_id: this.semester[0].id,
    registration_id: this.courseListForReg[0].registration_id,
    courses: this.selectedCourses.map(course => ({
      course_id: course.course_id,
      course_title: course.course_title_e,
      course_type: course.course_type_id
    }))
  };
  console.log('payload', payload);
    this.snackBar.open('Course Registered', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
}


  
}
