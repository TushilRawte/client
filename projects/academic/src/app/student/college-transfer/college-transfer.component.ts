import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environment';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-college-transfer',
  standalone: false,
  templateUrl: './college-transfer.component.html',
  styleUrl: './college-transfer.component.scss'
})
export class CollegeTransferComponent implements OnInit {
  getCollegeTransferDetailsForm!: FormGroup;
  studentDetails: any = null;
  file_prefix: string = environment.filePrefix;
  degree_id: number = 0;
  state = {
    academicSessionList: [] as any,
    degreeProgrammeList: [] as any,
    collegeList: [] as any,
    semesterList: [] as any,
    getCourseYear: [] as any,
  }
  generateColllegeTransferFormGroup!: FormGroup;
  rowsFormArray!: FormArray;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.getAcademicSession();
    this.getDegreeProgrammeData();
    this.getCollegeData();
    this.getSemesterData();
    this.getCourseYearData();
  }

  getStudentListOptions: any = {
    is_read: true,
    orientation: 'p',
    listLength: 0,
    is_pagination: false,
    is_server_pagination: false,
    is_filter: true,
    dataSource: [],
    button: ['print', 'pdf', 'copy', 'excel'],
    // button: [],
    is_render: true,
    page: 0,
    pageSize: 50,
    title: "Student Details"
  };

  createForm() {
    this.getCollegeTransferDetailsForm = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      college_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      university_order_ref_no: ['']
    });

    this.rowsFormArray = this.fb.array([]);
    this.generateColllegeTransferFormGroup = this.fb.group({
      rows: this.rowsFormArray
    });
  }

  getStudentListForSRC_Btn_click(actionType: string) {
    // clear old data
    this.getStudentListOptions.dataSource = [];
    this.getStudentListOptions.listLength = 0;

    // console.log("Form Value:", this.getCollegeTransferDetailsForm.value);
    if (actionType === 'refresh') {
      this.getCollegeTransferDetailsForm.reset();
    }
    if (actionType === 'show') {
      let { academic_session_id, degree_programme_id, college_id, semester_id, course_year_id } = this.getCollegeTransferDetailsForm.value
      // Validate required fields
      if (!academic_session_id || !degree_programme_id || !college_id || !semester_id || !course_year_id) {
        return this.alert.alertMessage("All Fields are Required", "", "warning");
      }

      // call API to get data
      this.http.getParam('/studentProfile/get/getStudentListForCollegeTransfer',
        {
          academic_session_id,
          degree_programme_id,
          college_id,
          semester_id,
          course_year_id,
        },
        'academic')
        .subscribe(
          (result: any) => {
            // console.log("result?.body==> ", result?.body);
            if (result?.body?.data?.length === 0) {
              this.alert.alertMessage("No Student Found for Transfer", "", "warning");
            } else if (result?.body?.error?.message) {
              this.alert.alertMessage(result?.body?.error?.message || "No Records found", "", "error");
            }
            else {
              let data = result?.body?.data || [];
              this.getStudentListOptions.dataSource = data;
              this.getStudentListOptions.listLength = data.length;

              // reset formArray
              this.rowsFormArray.clear();

              data.forEach((row: any) => {
                this.rowsFormArray.push(
                  this.fb.group({
                    new_college_id: [''],
                    university_transfer_order_no: ['']
                  })
                );
              });
            }

          },
          (error) => {
            console.error('Error in getStudentListForCollegeTransfer:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  transfer_btn(row: any, index: number) {
    const rowForm = this.rowsFormArray.at(index) as FormGroup;
    let { new_college_id, university_transfer_order_no } = rowForm.value;
    let { academic_session_id, degree_programme_id, college_id, course_year_id, semester_id } = this.getCollegeTransferDetailsForm.value
    if (!new_college_id) {
      return this.alert.alertMessage("All Fields are Required", "Please Select Transfered College Name.", "warning");
    }
    if (!university_transfer_order_no) {
      return this.alert.alertMessage("All Fields are Required", "Please Enter University Order Reference Number.", "warning");
    }

    if (new_college_id == college_id) {
      return this.alert.alertMessage("Old College and New College will not be the same.", "Please Enter Another College Name for Transfer.", "warning");
    }
    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);

    this.http.putData('/studentProfile/update/studentCollegeTransfer', {
      academic_session_id,
      degree_programme_id,
      degree_programme_type_id: selectedDegreePro[0]?.degree_programme_type_id || null,
      subject_id: selectedDegreePro[0]?.subject_id || null,
      degree_id: selectedDegreePro[0]?.degree_id || null,
      ue_id: row.ue_id,
      student_id: row.student_id,
      old_college_id: college_id,
      new_college_id,
      university_transfer_order_no,
      course_year_id,
      semester_id
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("studentCollegeTransfer====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "College Transfer Done.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          setTimeout(() => {
            this.getStudentListForSRC_Btn_click('show'); //^ reload page
          }, 5000);
        },
        (error) => {
          console.error('Error in studentCollegeTransfer:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  //* step: 1
  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession1', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("acadmcSessionList : ", result);
          this.state.academicSessionList = result.body.data;
        },
        (error) => {
          console.error('Error in acadmcSessionList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  //* step: 2
  getDegreeProgrammeData() {
    this.http.getParam('/master/get/getDegreePrograamList', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("degreeProgrammeList : ", result);
          this.state.degreeProgrammeList = result.body.data;
        },
        (error) => {
          console.error('Error in degreeProgrammeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  //* step: 3
  getCollegeData() {
    this.http.getParam('/master/get/getCollege',
      {},
      'academic')
      .subscribe(
        (result: any) => {
          // console.log("collegeList : ", result);
          this.state.collegeList = result.body.data;
        },
        (error) => {
          console.error('Error in collegeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  };

  //* step: 4
  getSemesterData() {
    this.http.getParam('/master/get/getSemesterList', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("semesterList : ", result.body.data);
          this.state.semesterList = result.body.data;
        },
        (error) => {
          console.error('Error in semesterList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        })
  };

  //* step: 5
  getCourseYearData() {
    this.http.getParam('/master/get/getCourseYear', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("getCourseYear : ", result.body.data);
          this.state.getCourseYear = result.body.data;
        },
        (error) => {
          console.error('Error in getCourseYear:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        }
      )
  }



}
