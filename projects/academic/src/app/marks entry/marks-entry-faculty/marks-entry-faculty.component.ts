import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-marks-entry-faculty',
  standalone: false,
  templateUrl: './marks-entry-faculty.component.html',
  styleUrl: './marks-entry-faculty.component.scss'
})
export class MarksEntryFacultyComponent {

  marksEntryFacultyFormGroup!:FormGroup
  showEmpIdField: boolean =false
  acadmcSesnList: any;
  degreeProgrammeTypeList: any;
  semesterList: any;
  courseList:any;
  attandanceList:any
  valuationTypeList:any
  examTypeList:any
  remarkList: any;
  getExamPaperTypeList: any;

  constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,){ }

  ngOnInit(): void {
        this.showEmpIdField = this.hasAllowedDesignation([327, 342, 2423]);
        this.marksEntryAdmin();
        this.getAcademicSession();
        this.getSemester();
        this.getDegreeProgrammeTypeData();
        this.getValuationType();
        this.getExamType();
        this.getRemark();
        this.getExamPaperType();
  }

  user: any = {
    emp_id: 100001,
    designation_arr: [327],
  };

    hasAllowedDesignation(allowed: number[]): boolean {
    return allowed.some(id => this.user?.designation_arr?.includes(id));
  }


  marksEntryAdmin() {
  this.marksEntryFacultyFormGroup = this.fb.group({
    emp_id: [this.user.emp_id, Validators.required],
    academic_session_id: ['', Validators.required],
    degree_programme_type_id: ['', Validators.required],
    semester_id: ['', Validators.required],
    valuation_type_id: ['', Validators.required],
    exam_type_id: ['', Validators.required],
    exam_paper_type_id: ['', Validators.required],
    course_nature_id: [''],
    course_id: [''],

    // Bulk student data
    students: this.fb.array([])   // <--- FormArray for rows
  });
}

// Easy getter for students array
get students(): FormArray {
  return this.marksEntryFacultyFormGroup.get('students') as FormArray;
}


populateStudents(attandanceList: any,selectedCourse: any) {
  this.students.clear();
  attandanceList.forEach((item: { ue_id: any; student_name: any; registration_id:any; college_id:any}) => {
    this.students.push(this.fb.group({
      ue_id: [item.ue_id],                   
      student_name: [item.student_name],      
      obtained_marks: ['', [Validators.min(0)]],
      remark_id: [],
      registration_id:[item.registration_id],
      college_id:[item.college_id],

         course_id: [selectedCourse.course_id],        
      dean_committee_id: [selectedCourse.dean_committee_id], 
      course_year_id: [selectedCourse.course_year_id],


      // auto attach from parent form
      academic_session_id:this.marksEntryFacultyFormGroup.get('academic_session_id')?.value,
      semester_id:this.marksEntryFacultyFormGroup.get('semester_id')?.value,
      exam_paper_type_id:this.marksEntryFacultyFormGroup.get('exam_paper_type_id')?.value,
      course_nature_id:this.marksEntryFacultyFormGroup.get('course_nature_id')?.value,
      exam_type_id: this.marksEntryFacultyFormGroup.get('exam_type_id')?.value,
      valuation_type_id: this.marksEntryFacultyFormGroup.get('valuation_type_id')?.value
    }));
  });
}




    getAcademicSession(){
      this.HTTP.getParam('/master/get/getAcademicSession1/', {}, 'academic').subscribe((result: any) => {
      // console.log('session', result);
      this.acadmcSesnList = result.body.data;
    });
  }

  // ~ ng init load degree programm type
  getDegreeProgrammeTypeData(){
    this.HTTP.getParam( '/master/get/getDegreeProgramType/',{},'academic').subscribe((result: any) => {
      // console.log(result);
      this.degreeProgrammeTypeList = result?.body?.data;
    });
  }

  // ~ ng init load semester
  getSemester(){
    this.HTTP.getParam('/master/get/getSemesterList/', {},'academic').subscribe((result: any) => {
      // console.log(result);
      this.semesterList = result.body.data;
    });
  }
    getValuationType(){
    this.HTTP.getParam('/master/get/getValuationType/', {},'academic').subscribe((result: any) => {
      // console.log(result);
      this.valuationTypeList = result.body.data;
    });
  }

  getExamType(){
    this.HTTP.getParam('/master/get/getExamType/', {},'academic').subscribe((result: any) => {
      // console.log(result);
      this.examTypeList = result.body.data;
    });
  }

  getRemark() {
    this.HTTP.getParam('/master/get/getRemark/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.remarkList = result.body.data;
    })
  }

    getExamPaperType() {
    this.HTTP.getParam('/master/get/getExamPaperType/',{} ,'academic').subscribe((result:any) => {
      // console.log(result);
      this.getExamPaperTypeList = result.body.data;
    })
  }

  onExamPaperTypeChange(selected: any) {
  this.marksEntryFacultyFormGroup.patchValue({
    exam_paper_type_id: selected.exam_paper_type_id,
    course_nature_id: selected.course_nature_id   // <-- set course nature here
  });
}

  getCourseList(){
    if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      emp_id:formValue.emp_id,
      academic_session_id : formValue.academic_session_id,
      semester_id : formValue.semester_id,
      degree_programme_type_id : formValue.degree_programme_type_id,
      exam_type_id:formValue.exam_type_id
    }

 this.HTTP.getParam('/attendance/get/getCourseWiseAttendance/', params, 'academic').subscribe((res: any) => {
  if (!res.body.error) {
    if (res.body.data && res.body.data.length > 0) {
      this.courseList = res.body.data;
      console.log(res.body.data);
    } else {
      this.alert.alertMessage("No Data Found...!", "", "warning");
       this.courseList = []
    }
  } else {
    this.alert.alertMessage("Something Went Wrong...!", "", "warning");
  }
});


  }

  getCourseListParticularData(item:any){
  this.getStudentList(item)
  }
  getStudentList(selectedCourse:any){
     if(this.marksEntryFacultyFormGroup.invalid){
        this.alert.alertMessage("Required", "Please fill all required fields.", "warning");
      return;
    }
    const formValue = this.marksEntryFacultyFormGroup.value
    const params = {
      emp_id:formValue.emp_id,
      academic_session_id : formValue.academic_session_id,
      semester_id : formValue.semester_id,
      degree_programme_type_id : formValue.degree_programme_type_id,
      // dean_committee_id:item.dean_committee_id,
      course_id:selectedCourse.course_id,
      course_registration_type_id:1,
      exam_type_id : formValue.exam_type_id
    }
    this.HTTP.getParam('/course/get/getStuWiseRegCourses/',params,'academic').subscribe((res:any) => {
       if (!res.body.error) {
         this.attandanceList = res.body.data;
         console.log(res.body.data);
        this.populateStudents(this.attandanceList,selectedCourse)
       }
       else{
         this.alert.alertMessage("Something Went Wrong...!", "", "warnig");
       }
    })
  }

  onSubmit1(){
    console.log(this.marksEntryFacultyFormGroup.value)
    const payload = this.marksEntryFacultyFormGroup.value
    
          this.HTTP.getParam('/attendance/get/checkInternalManuallyMarksEntryExist', payload, 'academic')
    .subscribe(res => {
      if (!res.body.error) {
        // this.alert.alertMessage("Record Inserted...!", "", "success");
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    });

    //       this.HTTP.postData('/attendance/post/saveStudentMarkEntryInternalManually', payload, 'academic')
    // .subscribe(res => {
    //   if (!res.body.error) {
    //     this.alert.alertMessage("Record Inserted...!", "", "success");
    //   } else {
    //     this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
    //   }
    // });
  }

//   onSubmit() {
//     console.log(this.marksEntryFacultyFormGroup.value);
//     const formData = this.marksEntryFacultyFormGroup.value;
    
//     // Extract students array and prepare payload for each student
//     const studentsPayload = formData.students.map((student: any) => ({
//         ue_id: student.ue_id,
//         registration_id: student.registration_id,
//         course_id: student.course_id,
//         course_year_id: student.course_year_id,
//         academic_session_id: student.academic_session_id,
//         exam_type_id: student.exam_type_id,
//         valuation_type_id: student.valuation_type_id,
//         exam_paper_type_id: student.exam_paper_type_id 
//     }));

//     const payload = {
//         students: studentsPayload
//     };

//     console.log('Final Payload:', payload);

//     this.HTTP.getParam('/attendance/get/checkInternalManuallyMarksEntryExist', payload, 'academic')
//         .subscribe(res => {
//             if (!res.body.error) {
//                 // Handle success response
//                 console.log('Check result:', res.body.data);
                
//                 // If data doesn't exist, proceed with saving
//                 if (res.body.data.all_exists === 'N') {
//                     // this.saveMarksEntry();
//                 } else {
//                     this.alert.alertMessage("Duplicate Found", "Some marks entries already exist", "warning");
//                 }
//             } else {
//                 this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
//             }
//         });
// }

onSubmit() {
  const formData = this.marksEntryFacultyFormGroup.value;

  // Loop through each student row
  formData.students.forEach((student: any) => {
    const params = {
      ue_id: student.ue_id,
      registration_id: student.registration_id,
      course_id: student.course_id,
      course_year_id: student.course_year_id,
      academic_session_id: student.academic_session_id,
      exam_type_id: student.exam_type_id,
      valuation_type_id: student.valuation_type_id,
      exam_paper_type_id: student.exam_paper_type_id
    };

    console.log("Checking student params:", params);

    // Send as query params
    this.HTTP.getParam('/attendance/get/checkInternalManuallyMarksEntryExist', params, 'academic')
      .subscribe((res: any) => {
        if (!res.body.error) {
          console.log('Check result for student:', student.ue_id, res.body.data);

          if (res.body.data.all_exists === 'N') {
            // ✅ No duplicate found → proceed with save
            // this.saveMarksEntry(student);
          } else {
            // ⚠️ Duplicate found → alert
            this.alert.alertMessage(
              "Duplicate Found",
              `Marks entry already exists for student ${student.ue_id}`,
              "warning"
            );
          }
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      });
  });
}




}
