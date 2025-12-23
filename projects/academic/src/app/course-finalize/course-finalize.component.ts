import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'; // Import OnInit
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
import { take } from 'rxjs';

@Component({
  selector: 'app-course-finalize',
  standalone: false,
  templateUrl: './course-finalize.component.html',
  styleUrl: './course-finalize.component.scss',
})
export class CourseFinalizeComponent implements OnInit {

  @ViewChild('print_content') print_content!: ElementRef;

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
  allotmentMain_id: any
  print_data: any;
  finalaizeStaus: any;
  showFinalizeButton: boolean = false;
  showUnfinalizeButton: boolean = false;
  isFinalizedStatusbtn: any;
  selectedDeanCommitteeId: any;
  // In the component class, add these properties:
selectedRowIndex: number = -1;
isFinalizedStatusForSelectedRow: string = '';

  constructor(
    private HTTP: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    private snackBar: MatSnackBar
  ) { }


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
    this.HTTP.getParam('/master/get/getAcademicSession/', {}, 'academic').subscribe((result: any) => {
      console.log(result);
      this.acadmcSesnList = result.body.data;
    })
  }

  getCollegeData() {
    this.HTTP.getParam('/master/get/getCollegeList/', {}, 'academic').subscribe((result: any) => {
      console.log(result);
      this.collegeList = result.body.data;
    })
  }

  // onCollegeChange(college_id: number) {
  //   console.log('Selected College ID:', college_id);
  //   this.getDegreeProgramme(college_id);
  // }

    onCollegeChange(college_id: number) {
  // console.log('Selected College ID:', college_id);
  this.getDegreeProgramme(college_id); 
  this.getChildCollegeForCounselling(college_id); 
  this.finalizecourseFormGroup.get('degree_programme_id')?.reset();
  this.courseYearList = [];
 }

  // getDegreeProgramme(college_id: number) {
  //   this.HTTP.getParam('/master/get/getDegreeProgramme/', { college_id }, 'academic').subscribe((result: any) => {
  //     console.log('GP', result);
  //     this.degreeProgramme = result.body.data;

  //   })
  // }

  getDegreeProgramme(college_id: number) {
  this.HTTP.getParam('/master/get/getDegreeProgramme/', { college_id }, 'academic')
    .subscribe((result: any) => {
      this.degreeProgramme = result.body.data;
      console.log('Initial Degree Programme:', this.degreeProgramme);

      // Add hardcoded objects only if college_id = 5
      if (college_id === 5) {
        const extraProgrammes = [
          {
            degree_programme_id: 14,
            degree_programme_name_e: "M.Sc.(Ag.) (PGS)",
            degree_id: 12,
            subject_id: 139
          },
          {
            degree_programme_id: 37,
            degree_programme_name_e: "Ph.D in Agriculture (PGS)",
            degree_id: 5,
            subject_id: 139
          }
        ];

        // Push into array
        this.degreeProgramme.push(...extraProgrammes);
      }

      console.log('Final Degree Programme:', this.degreeProgramme);
    });
}

  getallCourse() {
    this.HTTP.getParam('/master/get/getCourseList/', {}, 'academic').subscribe((result: any) => {
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
    this.HTTP.getParam('/master/get/getSemesterList/', {}, 'academic').subscribe((result: any) => {
      console.log(result);
      this.semesterList = result.body.data;
    })
  }

  //  / Method to call when semester dropdown changes
  onSemesterChange(semester_id: number) {
    console.log('Semester changed:', semester_id);
    this.getCourseYearList();
    this.responseData = [];
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
  
  this.HTTP.getParam('/master/get/getYearDeancmtList/', params, 'academic').subscribe((result: any) => {
    this.courseYearList = result.body.data;
    
    if (this.courseYearList && this.courseYearList.length > 0) {
      // Reset selected row
      this.selectedRowIndex = -1;
      this.responseData = [];
      
      // Loop through each year row and call status APIs
      this.courseYearList.forEach((row: any, index: number) => {
        const checkParams = {
          academic_session_id: params.academic_session_id,
          semester_id: params.semester_id,
          college_id: params.college_id,
          degree_programme_id: formValue.degree_programme_id,
          course_year_id: row.course_year_id,
          dean_committee_id: row.dean_committee_id
        };
        
        // Check allotment status
        this.HTTP.getParam('/master/get/checkCourseAllotment', checkParams, 'academic')
          .subscribe((response: any) => {
            const exists = response?.body?.data?.[0]?.data_exists === 1;
            row.allotmentStatus = exists;
          });
        
        // Check finalize status
        this.HTTP.getParam('/master/get/checkCourseFinalizeStatus', checkParams, 'academic')
          .subscribe((response: any) => {
            const finalizeYN = response?.body?.data?.[0]?.finalize_yn || 'N';
            row.finalizeStatus = finalizeYN;
          });
      });
    }
  });
}

getChildCollegeForCounselling(m_college_id: number) {
  this.HTTP.getParam('/master/get/getChildClgForCrsAllot/', { m_college_id }, 'academic')
    .subscribe((result: any) => {
      // console.log('child clg', result);
      this.childCollegeList = result.body.data;
      // console.log('child clg', this.childCollegeList);

      if (this.childCollegeList && this.childCollegeList.length > 0) {
        this.showChildButton = true;
        // this.snackBar.open('Child colleges found.', 'Close', { duration: 3000 });
      } else {
        this.showChildButton = false;
        this.snackBar.open('Master College can only Allot Course.', 'Close', { duration: 3000 });
      }
    }, error => {
      this.snackBar.open('Error fetching child colleges.', 'Close', { duration: 3000 });
    });
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

  // // old
  // getCourse(item: any) {
  //   const formValue = this.finalizecourseFormGroup.value;
  //   this.selectedCourseYearId = item.course_year_id;
  //   this.selectedDeanCommitteeId = item.dean_committee_id;
  //   if (
  //     !formValue.academic_session_id ||
  //     !formValue.college_id ||
  //     !formValue.degree_programme_id ||
  //     !formValue.semester_id ||
  //     !item.course_year_id ||
  //     !item.dean_committee_id
  //   ) {
  //     alert('Please fill all required fields before Print.');
  //     return;
  //   }
  //   const params = {
  //     academic_session_id: formValue.academic_session_id,
  //     college_id: formValue.college_id,
  //     degree_programme_id: formValue.degree_programme_id,
  //     semester_id: formValue.semester_id,
  //     dean_committee_id: item?.dean_committee_id,
  //     course_year_id: item?.course_year_id,
  //   };
  //   this.HTTP.getParam('/master/get/getCourseForUpdate/', params, "academic").subscribe(
  //     (result: any) => {
  //       this.responseData = result.body.data;
  //       this.print_row = result.body?.data?.courserows;
  //       // this.isShowbutton = true;  

  //     })

  // }

  getCourse(item: any, index: number) {
  const formValue = this.finalizecourseFormGroup.value;
  this.selectedCourseYearId = item.course_year_id;
  this.selectedDeanCommitteeId = item.dean_committee_id;
  this.selectedRowIndex = index; // Track which row is selected
  
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
  
  this.HTTP.getParam('/master/get/getCourseForUpdate/', params, "academic").subscribe(
    (result: any) => {
      this.responseData = result.body.data;
      this.print_row = result.body?.data?.courserows;
      
      // Get finalize status for this specific row
      this.getFinalizeStatusForRow(params, index);
    }
  );
}

getFinalizeStatusForRow(params: any, index: number) {
  this.HTTP.getParam('/master/get/checkCourseFinalizeStatus/', params, "academic")
    .subscribe((result: any) => {
      const data = result.body?.data;
      if (data && data.length > 0) {
        this.isFinalizedStatusForSelectedRow = data[0].finalize_yn;
        // Also update the row's finalizeStatus
        this.courseYearList[index].finalizeStatus = data[0].finalize_yn;
      }
    });
}


  chckFinlize(item: any) {
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
    this.HTTP.getParam('/master/get/checkCourseFinalizeStatus/', params, "academic")
      .subscribe((result: any) => {
        const data = result.body?.data;

        // if (!data || data.length === 0) {
        //   alert('No course allotted');
        //   this.showUnfinalizeButton = false;
        //   this.showFinalizeButton = false;
        //   return;
        // }

        this.finalaizeStaus = data[0]; // take first record
        console.log('check finalize', this.finalaizeStaus);

        if (this.finalaizeStaus.finalize_yn === 'Y') {
          this.showUnfinalizeButton = true;
          this.showFinalizeButton = false;
        } else if (this.finalaizeStaus.finalize_yn === 'N') {
          this.showUnfinalizeButton = false;
          this.showFinalizeButton = true;
        } else {
          this.showUnfinalizeButton = false;
          this.showFinalizeButton = false;
        }
      });

  }

  getCourseFoprint(item: any) {
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
    this.HTTP.getParam('/master/get/getCourseForUpdate/', params, "academic").subscribe(
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
          this.getPdf();
          // this.printData();
        }, 100);
      })
  }

  getPdf(): void {
    // console.log("this.options?.orientation : ", this.options?.orientation);
    // const html = this.print_content.nativeElement.innerHTML;
    const html = document.getElementById('print-section')?.innerHTML;

    this.HTTP.postBlob(`/file/post/htmltoPdf`, {
      html,
      title: `Course Allotment Report ${this.printDash?.session}`,
      college_name_e: this.printDash?.college,
      degree_programme_name_e: this.printDash?.programme
      // orientation: 'landscape'
    }, "course_allotment_report", "common").pipe(take(1)).subscribe(() => console.log("PDF Generated"));
  }

  // Old delete allotment method
  // deleteAllotment(item: any) {
  //   const formValue = this.finalizecourseFormGroup.value;
  //   if (
  //     !formValue.academic_session_id ||
  //     !formValue.college_id ||
  //     !formValue.degree_programme_id ||
  //     !formValue.semester_id ||
  //     !item.course_year_id ||
  //     !item.dean_committee_id
  //   ) {
  //     alert('Please fill all required fields before Print.');
  //     return;
  //   }
  //   const params = {
  //     academic_session_id: formValue.academic_session_id,
  //     college_id: formValue.college_id,
  //     degree_programme_id: formValue.degree_programme_id,
  //     semester_id: formValue.semester_id,
  //     dean_committee_id: item?.dean_committee_id,
  //     course_year_id: item?.course_year_id,
  //   };
  //   this.HTTP.getParam('/master/get/checkCourseFinalizeStatus', params, 'academic')
  //     .subscribe({
  //       next: (response: any) => {
  //         const allotmentData = response?.body?.data;

  //         if (Array.isArray(allotmentData) && allotmentData.length > 0) {
  //           const { allotment_main_id, finalize_yn } = allotmentData[0] || {};

  //           if (finalize_yn === 'Y') {
  //             alert('⚠️ Course finalized. Please unfinalize first before deleting.');
  //             return; // stop here
  //           }

  //           if (allotment_main_id) {
  //             this.allotmentMain_id = allotment_main_id;
  //             console.log('Allotment Main ID:', this.allotmentMain_id);

  //             // Ask for delete confirmation
  //             const confirmDelete = window.confirm('⚠️ Are you sure you want to delete this course allotment?');

  //             if (confirmDelete) {
  //               const deleteParams = {
  //                 allotment_main_id: this.allotmentMain_id
  //               };
  //              console.log('Delete Params:', deleteParams);
  //               this.HTTP.deleteData('/course/delete/deleteMultipleCourse', deleteParams, 'academic')
  //                 .subscribe({
  //                   next: (deleteRes: any) => {
  //                     console.log('✅ Delete successful:', deleteRes);
  //                     alert('✅ Course allotment deleted successfully.');
  //                         // this.getCourseYearList();
  //                     this.print_row = [];
  //                     this.responseData = [];
  //                   },
  //                   error: (deleteErr) => {
  //                     console.error('❌ Delete API failed:', deleteErr);
  //                     alert('❌ Failed to delete the course. Please try again.');
  //                   }
  //                 });
  //             } else {
  //               console.log('⛔ Deletion cancelled by user.');
  //             }
  //           }
  //         } else {
  //           alert('⚠️ No course allotted to delete.');
  //         }
  //       },
  //       error: (err) => {
  //         console.error('❌ Error while fetching allotment_main_id:', err);
  //         alert('❌ Error while checking course finalize status.');
  //       }
  //     });
  // }

deleteAllotment(item: any) {
  const formValue = this.finalizecourseFormGroup.value;

  if (
    !formValue.academic_session_id ||
    !formValue.college_id ||
    !formValue.degree_programme_id ||
    !formValue.semester_id ||
    !item.course_year_id ||
    !item.dean_committee_id
  ) {
    alert('Please fill all required fields before Delete.');
    return;
  }

  const params = {
    academic_session_id: formValue.academic_session_id,
    college_id: formValue.college_id,
    degree_programme_id: formValue.degree_programme_id,
    semester_id: formValue.semester_id,
    dean_committee_id: item.dean_committee_id,
    course_year_id: item.course_year_id,
  };

  this.HTTP.getParam('/master/get/checkCourseFinalizeStatus', params, 'academic')
    .subscribe({
      next: (response: any) => {
        const data = response?.body?.data;

        if (!Array.isArray(data) || !data.length) {
          alert('⚠️ No course allotted to delete.');
          return;
        }

        const { allotment_main_id, finalize_yn } = data[0];

        if (finalize_yn === 'Y') {
          alert('⚠️ Course finalized. Please unfinalize first before deleting.');
          return;
        }

        if (!allotment_main_id) {
          alert('⚠️ Allotment ID not found.');
          return;
        }

        // ✅ Declare ONCE
        let deleteApi = '';
        let deleteParams: any = {};

        // ✅ Assign based on allotment type
        if (item.allotment_type === 'I') {
          console.log('I am child');

          deleteApi = '/course/delete/deleteMultipleCourse';
          deleteParams = {
            allotment_main_id: allotment_main_id
          };

        } else if (item.allotment_type === 'M') {
          console.log('I am master');

          deleteApi = '/course/delete/deleteMultiClgCourseAllotment';
          deleteParams = {
            academic_session_id: formValue.academic_session_id,
            college_id: formValue.college_id,
            degree_programme_id: formValue.degree_programme_id,
            course_year_id: item.course_year_id,
            semester_id: formValue.semester_id,
            dean_committee_id: item.dean_committee_id,
          };

        } else {
          alert('⚠️ Invalid allotment type.');
          return;
        }

        const confirmDelete = window.confirm(
          '⚠️ If you delete this course allotment, you need to delete from Registration also. Are you sure you want to proceed?'
        );

        if (!confirmDelete) return;

        this.HTTP.deleteData(deleteApi, deleteParams, 'academic')
          .subscribe({
            next: () => {
              alert('✅ Course allotment deleted successfully.');
              this.print_row = [];
              this.responseData = [];
               this.getCourseYearList();
            },
            error: (err) => {
              console.error('❌ Delete failed:', err);
              alert('❌ Failed to delete the course allotment.');
            }
          });
      },
      error: (err) => {
        console.error('❌ Finalize check failed:', err);
        alert('❌ Error while checking finalize status.');
      }
    });
}




//   finlizeCourseAllotment() {
//   const payload = {
//     allotment_main_id: this.print_row[0]?.allotment_main_id
//   };
  
//   this.HTTP.putData('/course/update/updateFinalizeStatus/', payload, 'academic').subscribe(
//     (res: any) => {
//       if (!res.body.error) {
//         this.alert.alertMessage("Course Finalized.....!", "", "success");
        
//         // Update the finalize status for the selected row
//         if (this.selectedRowIndex !== -1) {
//           this.courseYearList[this.selectedRowIndex].finalizeStatus = 'Y';
//         }
        
//         this.print_row = [];
//         this.responseData = [];
//       } else {
//         this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning")
//       }
//     },
//   );
// }

unfinalizeCourseAllotment1() {
  const formValue = this.finalizecourseFormGroup.value;
  if (
    !formValue.academic_session_id ||
    !formValue.college_id ||
    !formValue.degree_programme_id ||
    !formValue.semester_id ||
    !this.selectedCourseYearId ||
    !this.selectedDeanCommitteeId
  ) {
    alert('Please fill all required fields OR Click to Show Course Button to Unfinalize.');
    return;
  }

  const payload = {
    academic_session_id: formValue.academic_session_id,
    college_id: formValue.college_id,
    degree_programme_id: formValue.degree_programme_id,
    semester_id: formValue.semester_id,
    course_year_id: this.selectedCourseYearId,
    dean_committee_id: this.selectedDeanCommitteeId,
    allotment_main_id: this.print_row[0]?.allotment_main_id
  };

  this.HTTP.putData('/course/update/updateUnfinalizeStatus/', payload, 'academic').subscribe(
    (res: any) => {
      if (!res.body.error) {
        this.alert.alertMessage("Course Unfinalized.....!", "", "success");
        
        // Update the finalize status for the selected row
        if (this.selectedRowIndex !== -1) {
          this.courseYearList[this.selectedRowIndex].finalizeStatus = 'N';
        }
        
        this.print_row = [];
        this.responseData = [];
      } else {
        this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
      }
    },
    (error) => {
      console.error('Error in unfinalizeCourseAllotment:', error);
      this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
    }
  );
}

unfinalizeCourseAllotment() {
  const formValue = this.finalizecourseFormGroup.value;

 if (
    !formValue.academic_session_id ||
    !formValue.college_id ||
    !formValue.degree_programme_id ||
    !formValue.semester_id ||
    !this.selectedCourseYearId ||
    !this.selectedDeanCommitteeId
  ) {
    alert('Please fill all required fields OR Click to Show Course Button to Unfinalize.');
    return;
  }

  const params = {
    academic_session_id: formValue.academic_session_id,
    college_id: formValue.college_id,
    degree_programme_id: formValue.degree_programme_id,
    semester_id: formValue.semester_id,
    course_year_id: this.selectedCourseYearId,
    dean_committee_id: this.selectedDeanCommitteeId,
    allotment_main_id: this.print_row[0]?.allotment_main_id
  };
console.log('Unfinalize params:', params);

  this.HTTP
    .getParam('/course/get/getCourseAllotmentMainDetailIds/', params, 'academic')
    .subscribe(
      (result: any) => {

        const data = result?.body?.data || [];

        // ✅ 1. Empty check
        if (!data.length) {
          this.snackBar.open('Course not allotted.', 'Close', { duration: 5000 });
          return;
        }

        // ✅ 2. Remove duplicate allotment_main_id
        const uniqueMainIds = [
          ...new Set(data.map((item: any) => item.allotment_main_id))
        ];

        // ✅ 3. Prepare payload
        const payload = {
          allotment_main_id: uniqueMainIds
        };

        console.log('finalize payload', payload);

        // ✅ Finalize API
        this.HTTP.putData('/course/update/updateUnfinalizeStatus/', payload, 'academic')
          .subscribe((res: any) => {
            if (!res.body?.error) {
              this.alert.alertMessage("Course Unfinalized.....!", "", "success");
               if (this.selectedRowIndex !== -1) {
                  this.courseYearList[this.selectedRowIndex].finalizeStatus = 'N';
                }
                
                // ✅ Also clear the displayed course data (important!)
                this.responseData = [];
                this.print_row = [];
            } else {
             this.alert.alertMessage("Something went wrong!", res.body.error?.message, "warning");
            }
          });

      },
      (error) => {
        console.error('API Error:', error);
      }
    );
}



}
