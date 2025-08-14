import { Component, OnInit } from '@angular/core'; // Import OnInit
import { HttpService, AlertService, PrintService } from 'shared';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ViewCourseallotmentComponent } from '../view-courseallotment/view-courseallotment.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-course-finalize',
  standalone: false,
  templateUrl: './course-finalize.component.html',
  styleUrl: './course-finalize.component.scss',
})
export class CourseFinalizeComponent implements OnInit {
  // Implement OnInit

  acadmcSesnList: any = [];
  collegeList: any = [];
  degreeProgramme: any = [];
  semesterList: any = [];
  courseYearList: any = [];
  courseTypeList: any = [];
  courseAllotType: any = [];
  courseList: any = [];
  finalizecourseFormGroup!: FormGroup;
  selectedCourseData: any;
  currentData: any;
  selectedCourseYearId: any;
  printDash: any;
  print_row: any;
  isFinalized: boolean = false;
  childCollegeList: any;
  showChildButton: boolean = false;
  allCourses: any = [];
  selectedDegree: any;
  responseData: any;
  course: any;
  isFinalizedStatus: any;
  isShowbutton: boolean = false;
  allotmentMain_id:any
  print_data: any;
  currentDateTime = new Date().toLocaleString();

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    private snackBar: MatSnackBar
  ) {}

  
  ngOnInit(): void {
    // Add : void for clarity
    this.getAcademicSession();
    this.getCollegeData();
    this.getSemester();
    this.getCourseList();
    this.getCourseType();
    this.getCourseAllotType();
    this.finalizeCourseForm();
  }

  finalizeCourseForm() {
    this.finalizecourseFormGroup = this.fb.group({
      academic_session_id: ['', Validators.required],
      college_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      // deanCommittee: [null, Validators.required],
    });
  }


  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1/',{},'academic').subscribe((result:any) => {
      console.log(result);
      this.acadmcSesnList = result.body.data;
    })
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList1/',{} ,'academic').subscribe((result:any) => {
      console.log(result);
      this.collegeList = result.body.data;
    })
  }

  onCollegeChange(college_id: number) {
  console.log('Selected College ID:', college_id);
  this.getDegreeProgramme(college_id); 
 }




  getDegreeProgramme(college_id:number) {
    this.HTTP.getParam('/master/get/getDegreePrograamList/',{college_id},'academic').subscribe((result:any) => {
      console.log('GP',result);
      this.degreeProgramme = result.body.data;

    })
  }

  getallCourse() {
    this.HTTP.getParam('/master/get/getCourseList/',{},'academic').subscribe((result:any) => {
      // console.log(result);
      this.allCourses = result.body.data;
    })
  }
  
  hasSpecificProgramme: boolean = false;
  onDegreeProgrammeChange(degree_programme_id: number) {
    const selected = this.degreeProgramme.find((p: { degree_programme_id: number; }) => p.degree_programme_id === degree_programme_id);
    const degree_id = selected?.degree_id;
    console.log('degree_id to send:', degree_id);
    this.selectedDegree = degree_id
    // ✅ Check if selected degree_programme_id is 1, 2, or 3
  this.hasSpecificProgramme = [1, 2, 3].includes(degree_programme_id);
  console.log('hasSpecificProgramme:', this.hasSpecificProgramme);
  this.finalizecourseFormGroup.get('semester_id')?.reset();
  this.courseYearList = []; // Reset courseYearList when degree_programme_id changes

  }

  getSemester() {
    this.HTTP.getParam('/master/get/getSemesterList/',{} ,'academic').subscribe((result:any) => {
      console.log(result);
      this.semesterList = result.body.data;
    })
  }

//  / Method to call when semester dropdown changes
onSemesterChange(semester_id: number) {
  console.log('Semester changed:', semester_id);
  this.getCourseYearList();
}


  getCourseYearList() {
    const formValue = this.finalizecourseFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.semester_id 
    ) {
      alert('Please fill all required fields ...');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id,
      semester_id: formValue.semester_id,
      college_id: formValue.college_id,
      degree_id: this.selectedDegree
    };
    console.log('Params for course year list:', params);
    this.HTTP.getParam('/master/get/getYearDeancmtList/',params ,'academic').subscribe((result:any) => {
      console.log('course Year',result);
      this.courseYearList = result.body.data;
      if (this.courseYearList && this.courseYearList.length > 0) {
        // Loop through each year row and call status API
        this.courseYearList.forEach((row: any, index: number) => {
          const checkParams = {
            academic_session_id: params.academic_session_id,
            semester_id: params.semester_id,
            college_id: params.college_id,
            degree_programme_id: formValue.degree_programme_id,
            course_year_id: row.course_year_id,
            dean_committee_id: row.dean_committee_id
          };
          // this.HTTP.getParam('/master/get/checkCourseAllotment', checkParams, 'academic').subscribe((response: any) => {
          //   const exists = response.body?.data?.data_exists === 1;
          //   console.log('Allotment status for row', index, ':', exists);
          //   this.courseYearList[index].allotmentStatus = exists;
          // });
          this.HTTP.getParam('/master/get/checkCourseAllotment', checkParams, 'academic')
          .subscribe((response: any) => {
            const exists = response?.body?.data?.[0]?.data_exists === 1;
            row.allotmentStatus = exists; // ✅ Update directly on the row
          });
          this.HTTP.getParam('/master/get/checkCourseFinalizeStatus', checkParams, 'academic')
          .subscribe((response: any) => {
            console.log('Response for finalize status:', response);
            const finalizeYN = response?.body?.data[0].finalize_yn;
            console.log('ddd', finalizeYN);
            this.courseYearList[index].finalizeStatus = finalizeYN; 
          });
        });
      }
    })
  }

  getCourseList() {
    this.HTTP.getParam(
      '/master/get/getCourseForAllot/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseList = result.body.data;
    });
  }

  getCourseType() {
    this.HTTP.getParam(
      '/master/get/getCourseTypeList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseTypeList = result.body.data;
    });
  }

  getCourseAllotType() {
    this.HTTP.getParam(
      '/master/get/getCourseAllotmentTypeList/',
      {},
      'academic'
    ).subscribe((result: any) => {
      console.log(result);
      this.courseAllotType = result.body.data;
    });
  }



  getCourse(item:any){
    const formValue = this.finalizecourseFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.semester_id ||
      !item.course_year_id ||
      !item.dean_committee_id
    ) {
      alert('Please fill all required fields before Print.');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id,
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      semester_id: formValue.semester_id,
      dean_committee_id: item?.dean_committee_id, 
      course_year_id: item?.course_year_id,  
    };
    this.HTTP.getParam('/master/get/getCourseForUpdate/',params,"academic").subscribe(
      (result: any) => {
        this.responseData = result.body.data;
        this.print_row = result.body?.data?.courserows;
        this.isShowbutton = true;
        
      })

  }


  getCourseFoprint(item:any){
    const formValue = this.finalizecourseFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.semester_id ||
      !item.course_year_id ||
      !item.dean_committee_id
    ) {
      alert('Please fill all required fields before Print.');
      return;

    }
    const sessionObj = this.acadmcSesnList.find(
      (s: { academic_session_id: any }) =>
        s.academic_session_id === formValue.academic_session_id
    );
    const collegeObj = this.collegeList.find(
      (c: { college_id: any }) => c.college_id === formValue.college_id
    );
    const programmeObj = this.degreeProgramme.find(
      (p: { degree_programme_id: any }) =>
        p.degree_programme_id === formValue.degree_programme_id
    );
    const semesterObj = this.semesterList.find(
      (s: { semester_id: any }) => s.semester_id === formValue.semester_id
    );
    
    this.printDash = this.selectedCourseData = {
      session: sessionObj?.academic_session_name_e || '',
      college: collegeObj?.college_name_e || '',
      programme: programmeObj?.degree_programme_name_e || '',
      semester: semesterObj?.semester_name_e || '',
      semester_id: semesterObj?.semester_id || null,
      deanCommittee: item.dean_commite_name_e,
      deanCommittee_id: item.dean_committee_id,
      course_year_id: item.course_year_id,
      course_year_name_e: item.course_year_name_e,
    };

    const params = {
      academic_session_id: formValue.academic_session_id,
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      semester_id: formValue.semester_id,
      dean_committee_id: item?.dean_committee_id, 
      course_year_id: item?.course_year_id,  
    };
    this.HTTP.getParam('/master/get/getCourseForUpdate/',params,"academic").subscribe(
      (result: any) => {
        // this.responseData = result.body.data;
        this.print_data = result.body?.data?.courserows;
        this.isShowbutton = true;
        if (!this.print_data || this.print_data.length === 0) {
          alert('❌ No data available for print.');
          return;
        }
        // this.printData() 
        setTimeout(() => {
          this.printData();
        }, 100); 
      })
  }

  printData() {
    const content = document.getElementById('print-section')?.innerHTML;
    if (content) {
      this.print.printHTML(content);
    } else {
      console.error('Printable section not found');
    }
  }

  deleteAllotment(item:any){
    const formValue = this.finalizecourseFormGroup.value;
    if (
      !formValue.academic_session_id ||
      !formValue.college_id ||
      !formValue.degree_programme_id ||
      !formValue.semester_id ||
      !item.course_year_id ||
      !item.dean_committee_id
    ) {
      alert('Please fill all required fields before Print.');
      return;
    }
    const params = {
      academic_session_id: formValue.academic_session_id,
      college_id: formValue.college_id,
      degree_programme_id: formValue.degree_programme_id,
      semester_id: formValue.semester_id,
      dean_committee_id: item?.dean_committee_id, 
      course_year_id: item?.course_year_id,  
    };
    this.HTTP.getParam('/master/get/checkCourseFinalizeStatus', params, 'academic')
  .subscribe({
    next: (response: any) => {
      const allotmentData = response?.body?.data;

      if (Array.isArray(allotmentData) && allotmentData.length > 0 && allotmentData[0].allotment_main_id) {
        this.allotmentMain_id = allotmentData[0].allotment_main_id;
        console.log('Allotment Main ID:', this.allotmentMain_id);

        // Ask for delete confirmation
        const confirmDelete = window.confirm('⚠️ Are you sure you want to delete this course allotment?');

        if (confirmDelete) {
          const deleteParams = {
            allotment_main_id: this.allotmentMain_id
          };

          this.HTTP.deleteData('/course/delete/deleteMultipleCourse', deleteParams, 'academic')
            .subscribe({
              next: (deleteRes: any) => {
                console.log('✅ Delete successful:', deleteRes);
                alert('✅ Course allotment deleted successfully.');
                this.print_row = [];
                this.responseData = [];
              },
              error: (deleteErr) => {
                console.error('❌ Delete API failed:', deleteErr);
                alert('❌ Failed to delete the course. Please try again.');
              }
            });
        } else {
          console.log('⛔ Deletion cancelled by user.');
        }

      } else {
        alert('⚠️ No course allotted to delete.');
      }
    },
    error: (err) => {
      console.error('❌ Error while fetching allotment_main_id:', err);
      alert('❌ Error while checking course finalize status.');
    }
  });




  }

  // Finalize and Unfinalize Course Allotment Methods ------------------------------

  finlizeCourseAllotment() {
    const payload = {
      allotment_main_id:this.print_row[0]?.allotment_main_id
    }
    console.log(payload);
    
    console.log();
    this.HTTP.putData('/course/update/updateFinalizeStatus/', payload, 'academic').subscribe(
      (res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Course Finalized.....!", "", "success");
          this.print_row = [];
          this.responseData = [];
          this.getCourseYearList();
        } else {
          this.alert.alertMessage("Something went wring!", res.body.error?.message, "warning")
        }
      },
    );

  }

  unfinalizeCourseAllotment() {
    const payload = {
      allotment_main_id: this.print_row[0]?.allotment_main_id
    }
    console.log('Payload for unfinalize:', payload);
    this.HTTP.putData('/course/update/updateUnfinalizeStatus/', payload, 'academic').subscribe(
      (res: any) => {
        if (!res.body.error) {
          this.alert.alertMessage("Course Finalized.....!", "", "success");
          this.print_row = [];
          this.responseData = [];
          
          // Call getCourseYearList() after successful unfinalize operation
          this.getCourseYearList();
          
        } else {
          this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
        }
      },
      (error) => {
        // Handle HTTP error
        console.error('Error in unfinalizeCourseAllotment:', error);
        this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
      }
    );
  }


}
