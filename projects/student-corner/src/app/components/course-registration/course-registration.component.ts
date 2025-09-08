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
  registeredCourseList: any;
  isRegistrationAllowed: boolean = true;
  failedCoursesList: any;
   
  constructor(private snackBar: MatSnackBar,private fb : FormBuilder,private HTTP : HttpService,private alert: AlertService) {}

  ngOnInit() {
    this.getAcademicSession();
    this.getCollegeData();
    this.getDegreeProgramme();
    this.getallCourse();  
    this.getSemester();
    this.mainforfun();
    this.getCourseForRegistration();
    this.getOtherDeptCourseForRegistration();
    this.getRegisteredCourses();
    // this.getFailedCourse();
  }

    mainforfun() {
        this.courseRegistrationForm = this.fb.group({

        });
      }

      academicSessions = [
      { id: 23, value: '2023-2024' }
    ];
    year = [
      { id: 3, value: '1st Year' }
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
    this.HTTP.getParam('/course/get/getCourseFromAllotment/',{},'academic').subscribe((result:any) => {
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

    getRegisteredCourses(){
      const params = {
        academic_session_id: this.academicSessions[0].id,
        course_year_id: this.year[0].id,
        semester_id: this.semester[0].id,
        college_id:5,
        degree_programme_id:1,
        ue_id: 20220725
      }
       this.HTTP.getParam('/course/get/getRegisteredCourseList/',params ,'academic').subscribe((result:any) => {
       this.registeredCourseList = result.body.data;
      this.selectedCourses = [...this.registeredCourseList];
      console.warn("this is registed courses by student:",this.registeredCourseList);
      this.getFailedCourse(); 
    })
  }  

  getOtherDeptCourseForRegistration() {
      const params  = {
      academic_session_Id: this.academicSessions[0].id,
      course_year_id: this.year[0].id,
      college_id:5,
      semester_id: this.semester[0].id,
    }
    this.HTTP.getParam('/course/get/getCourseFromAllotment/',params ,'academic').subscribe((result:any) => {
      console.log('other dept course list',result);
      this.otherDeptcourseListForReg = result.body.data;
    })
  }


  onCourseAdd(courseId: any) {
  this.selectedCourses.push(courseId);
  console.log('Added:', courseId, 'Array:', this.selectedCourses);
}

onCourseRemove(courseId: any) {
  this.selectedCourses = this.selectedCourses.filter(id => id !== courseId);
  console.log('Removed:', courseId, 'Array:', this.selectedCourses);
}
  


onSelectOtherCourses(event: any) {
  console.log('Selected:', event); 

}


  // course list for registration 
    getCourseForRegistration() {
   const params  = {
      academic_session_Id: this.academicSessions[0].id,
      course_year_id: this.year[0].id,
      degree_programme_id:1,
      college_id:5,
      semester_id: this.semester[0].id,
    }
    this.HTTP.getParam('/course/get/getCourseFromAllotment/',params ,'academic').subscribe((result:any) => {
      console.log('course list',result);
      this.courseListForReg = result.body.data;
      if (this.courseListForReg && this.courseListForReg.length > 0) {
        // condition check
        this.isRegistrationAllowed = 
          this.courseListForReg[0].registration_status_id !== 2;
      } else {
        this.isRegistrationAllowed = true; 
      }
    })
  }

  getFailedCourse(){
    const params  = {
      Academic_Session_Id: this.academicSessions[0].id - 1,
      course_year_id : this.year[0].id - 1,
      Semester_Id: this.semester[0].id,
      ue_id: 20220725
    }
    this.HTTP.getParam('/course/get/getFailedCoursesForReg/',params ,'academic').subscribe((result:any) => {
      this.failedCoursesList = result.body.data;
       // Automatically select failed courses
       console.warn('failed course',this.failedCoursesList);
       
    if (this.failedCoursesList && this.failedCoursesList.length > 0) {
      this.autoSelectFailedCourses();
    }    
    })
  }

  // New method to automatically select failed courses
autoSelectFailedCourses() {  
  this.failedCoursesList.forEach((failedCourse: any) => {
    // Check if this failed course is not already in selectedCourses
    const isAlreadySelected = this.selectedCourses.find(c => 
      c.course_id === failedCourse.course_id && 
      c.course_nature_id === failedCourse.course_nature_id
    );
    
    if (!isAlreadySelected) {
      // Add failed course to selected courses
     ;
      
      this.selectedCourses.push(failedCourse);
    
}
  });
  
  // Optional: Show notification about auto-selected courses
  if (this.failedCoursesList.length > 0) {
    this.snackBar.open(
      `${this.failedCoursesList.length} failed course(s) automatically selected`, 
      'Close', 
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      }
    );
  }
}

// Helper method to check if a course is a failed course
isFailedCourse(course: any): boolean {
  if (!this.failedCoursesList || this.failedCoursesList.length === 0) {
    return false;
  }
  return this.failedCoursesList.some((fc: { course_id: any; course_nature_id: any; }) => 
    fc.course_id === course.course_id && fc.course_nature_id === course.course_nature_id
  );
}
  
//   selectCourse(course: any) {
//   // Prevent duplicate (course_id + course_nature_id)
//   if (this.selectedCourses.find(c => 
//       c.course_id === course.course_id && c.course_nature_id === course.course_nature_id)) {
//     this.snackBar.open('This course with the same nature is already selected', 'Close', {
//       duration: 2000,
//       verticalPosition: 'top',
//       horizontalPosition: 'center'
//     });
//     return;
//   }
//   this.selectedCourses.push(course);
// }

selectCourse(course: any) {
  // Prevent duplicate (course_id + course_nature_id)
  if (this.selectedCourses.find(c => 
      c.course_id === course.course_id && c.course_nature_id === course.course_nature_id)) {
    this.snackBar.open('This course with the same nature is already selected', 'Close', {
      duration: 2000,
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
    return;
  }
  this.selectedCourses.push(course);
}

// removeCourse(courseId: number, courseNatureId: number) {
//   // Remove only that exact pair
//   this.selectedCourses = this.selectedCourses.filter(c => 
//     !(c.course_id === courseId && c.course_nature_id === courseNatureId)
//   );
// }

// Updated removeCourse method with protection for failed courses (optional)
removeCourse(courseId: number, courseNatureId: number) {
  // Optional: Check if this is a failed course and show confirmation
  const isFailedCourse = this.failedCoursesList?.find((c: { course_id: number; course_nature_id: number; }) => 
    c.course_id === courseId && c.course_nature_id === courseNatureId
  );
  
  if (isFailedCourse) {
    // Optional: Show confirmation dialog for removing failed courses
    const confirmRemoval = confirm('This is a failed course. Are you sure you want to remove it?');
    if (!confirmRemoval) {
      return;
    }
  }
  
  // Remove only that exact pair
  this.selectedCourses = this.selectedCourses.filter(c => 
    !(c.course_id === courseId && c.course_nature_id === courseNatureId)
  );
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
      course_type_id: course.course_type_id,
      course_nature_id: course.course_nature_id,
    }))
  };

     console.log('Sending payload to update API:', payload);
  
    this.HTTP.postData('/course/post/saveStudentCourseRegistration', payload, 'academic').subscribe(
      (res: any) => {
        console.log('Response from Saved API:', res);
        
        if (!res.body.error) {
          this.alert.alertMessage("Record Saved...!", "", "success");
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      }
    );
    this.updateRegistrationStatus();
}

updateRegistrationStatus(){
   const payload = {
   registration_id: this.courseListForReg[0].registration_id,
    }
    console.log('Payload for updateCourseRegiStatus:', payload);
    this.HTTP.putData('/course/update/updateCourseRegiStatus/', payload, 'academic').subscribe(
      (res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Course Registraion Status Updated.....!", "", "success");
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      },
      (error) => {
        // Handle HTTP error
        console.error('Error in Registraion Status:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );
}

onUpdate() {
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
      course_type_id: course.course_type_id,
      course_nature_id: course.course_nature_id,
    }))
  };

     console.log('Sending payload to update API:', payload);
  
    this.HTTP.putData('/course/update/updateStudentCourseRegistration', payload, 'academic').subscribe(
      (res: any) => {
        console.log('Response from update API:', res);
        
        if (!res.body.error) {
          this.alert.alertMessage("Record Updated...!", "", "success");
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      }
    );
}


  
}
