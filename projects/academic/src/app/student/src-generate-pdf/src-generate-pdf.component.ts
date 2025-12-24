import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environment';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-src-generate-pdf',
  standalone: false,
  templateUrl: './src-generate-pdf.component.html',
  styleUrl: './src-generate-pdf.component.scss'
})
export class SrcGeneratePdfComponent implements OnInit {
  getSRCDetailsForm!: FormGroup;
  studentDetails: any = null;
  file_prefix: string = environment.filePrefix;
  degree_id: number = 0;
  selectAll: boolean = true;
  state = {
    academicSessionList: [] as any,
    degreeProgrammeList: [] as any,
    collegeList: [] as any,
    semesterList: [] as any,
    getCourseYear: [] as any,
    examTypeList: [] as any,
  }
  generateSRCFormGroup!: FormGroup;

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
    this.getExamTypeData();
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
    this.getSRCDetailsForm = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      college_id: ['', Validators.required],
      semester_id: ['', Validators.required],
      course_year_id: ['', Validators.required],
      exam_type_id: ['', Validators.required],
      ue_id: [''],
      selected: ['']
    });
  }

  onToggleSelectAll(checked: boolean) {
    this.selectAll = checked;
    const rows = this.studentRowsFormArray.controls;
    rows.forEach((row: any) => row.get('selected').setValue(checked));
  }

  getStudentListForSRC_Btn_click(actionType: string) {
    // clear old data
    this.getStudentListOptions.dataSource = [];
    this.getStudentListOptions.listLength = 0;

    // console.log("Form Value:", this.getSRCDetailsForm.value);
    if (actionType === 'refresh') {
      this.getSRCDetailsForm.reset();
    }
    if (actionType === 'show') {
      let { academic_session_id, degree_programme_id, college_id, semester_id, course_year_id, exam_type_id, ue_id } = this.getSRCDetailsForm.value
      let params;

      if (ue_id) {
        // Search by UE ID only
        params = { ue_id: ue_id.trim() };
      } else {
        // Validate required fields
        if (!academic_session_id || !degree_programme_id || !college_id || !semester_id || !course_year_id || !exam_type_id) {
          return this.alert.alertMessage("All Fields are Required", "", "warning");
        }

        // Search by session + program + college
        params = {
          academic_session_id,
          degree_programme_id,
          college_id,
          semester_id,
          course_year_id,
          exam_type_id
        };
      }

      // call API to get data
      this.http.getParam('/studentProfile/get/getStudentListForSRC',
        params,
        'academic')
        .subscribe(
          (result: any) => {
            // console.log("result?.body==> ", result?.body);
            if (result?.body?.data?.length === 0) {
              this.alert.alertMessage("Invalid User", "No Records Found in Databse", "error");
            } else if (result?.body?.error?.message) {
              this.alert.alertMessage(result?.body?.error?.message || "No Degree Found OR Invalid UE ID", "", "error");
            }
            else {
              let data = result?.body?.data || [];
              this.getStudentListOptions.dataSource = data;
              this.getStudentListOptions.listLength = data.length;
              // ⬅️ Build form for table rows
              this.createGenerateSRCForm(data);
            }
          },
          (error) => {
            console.error('Error in getStudentListForSRC:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  private createGenerateSRCForm(data: any[]) {
    this.generateSRCFormGroup = this.fb.group({
      studentRows: this.fb.array([])
    });

    const control = this.generateSRCFormGroup.get('studentRows') as any;

    data.forEach((row, index) => {
      control.push(
        this.fb.group({
          formIndex: index,
          // selected = true only when NOT generated
          selected: [{
            value: row.src_gen_yn !== 'Y',
            disabled: row.src_gen_yn === 'Y'
          }],
          student_id: [row.student_id],
          ue_id: [row.ue_id],
          src_gen_yn: [row.src_gen_yn],
          src_required: [row.src_required],
          degree_completed_session: [row.degree_completed_session],
          admission_session: [row.admission_session],
          certificate_id: [row.certificate_id],
          certificate_number: [row.certificate_number],
          src_main_id: [row.src_main_id],
          deleting_reason: ['']
        })
      );
    });
  }

  get studentRowsFormArray() {
    return this.generateSRCFormGroup.get('studentRows') as any;
  }

  getSRC(row: any) {
    // console.log("row ====dds>> ", row);
    let { ue_id, src_main_id } = row;
    let { academic_session_id, semester_id, exam_type_id, degree_programme_id } = this.getSRCDetailsForm.value
    let srcTitle = `Semester_Report_Card_${ue_id}`
    this.http.postBlob(`/file/post/semesterReportCardPdf`, {
      // orientation: 'landscape'
      ue_id,
      src_main_id,
      semester_id,
      academic_session_id,
      exam_type_id,
      degree_id: degree_programme_id
    }, srcTitle, "academic").pipe(take(1))
      .subscribe(
        (response) => {
          // console.log("response :=> ", response.body);
          const blob = response.body;
          if (blob) {
            // 
          } else {
            this.alert.alertMessage("No Records Found!", "Failed to download report.", "error");
            return
          }
        },
        (error) => {
          console.error('Error downloading PDF:', error);
          this.alert.alertMessage("Something went wrong!", "Failed to download report. Please try again later.", "error");
        }
      );
  }

  generateSRC_btn() {
    const selectedRows = this.studentRowsFormArray.value.filter((r: any) => r.selected);

    if (selectedRows.length === 0) {
      this.alert.alertMessage("No Selection", "Please select at least one student.", "error");
      return;
    }

    // console.log("Selected students:", selectedRows);

    let { academic_session_id, degree_programme_id, college_id, ue_id } = this.getSRCDetailsForm.value

    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);
    // console.log("selectedDegreePro ===>> ", selectedDegreePro);

    this.http.postData('/studentProfile/post/generateSRC', {
      academic_session_id: academic_session_id,
      degree_programme_id: degree_programme_id,
      college_id: college_id,
      degree_id: selectedDegreePro[0]?.degree_id,
      degree_programme_type_id: selectedDegreePro[0]?.degree_programme_type_id,
      ue_id: ue_id,
      students: selectedRows
    }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("generatePdc====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "SRC Generated.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getStudentListForSRC_Btn_click('show'); //^ reload page
        },
        (error) => {
          console.error('Error in generatePdc:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  async deleteSRC_btn(row: any, index: number) {
    // Show confirmation dialog
    const result = await this.alert.confirmAlert(
      "Are you sure you want to delete this SRC?",
      '',
      "question"
    );
    // result.value is true if user confirmed
    if (!result.value) {
      // User clicked "No" or dismissed the modal
      return;
    }

    // ✅ Get deleting_reason from form
    const deleting_reason = this.studentRowsFormArray.at(index).get('deleting_reason')?.value;

    if (!deleting_reason || deleting_reason.trim() === '') {
      this.alert.alertMessage(
        "Delete Reason is Required",
        "Please enter the correct reason",
        "warning"
      );
      return;
    }
    // attach reason to row or payload
    row.deleting_reason = deleting_reason;

    // delete operation
    let { academic_session_id, degree_programme_id, college_id, ue_id, semester_id, course_year_id } = this.getSRCDetailsForm.value
    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);
    let payload = {
      academic_session_id,
      degree_programme_id,
      college_id,
      semester_id,
      course_year_id,
      degree_id: selectedDegreePro[0]?.degree_id,
      degree_programme_type_id: selectedDegreePro[0]?.degree_programme_type_id,
      ue_id,
      students: JSON.stringify([row])
    }
    this.http.deleteData('/studentProfile/delete/deleteSRC', payload, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("deleteSRC====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "SRC Deleted.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getStudentListForSRC_Btn_click('show'); //^ reload page
        },
        (error) => {
          console.error('Error in deleteSRC:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }




  getAcademicSession() {
    this.http.getParam('/master/get/getAcademicSession', {}, 'academic')
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

  getDegreeProgrammeData() {
    this.http.getParam('/master/get/getDegreeProgramme', {}, 'academic')
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

  getCollegeData() {
    this.http.getParam('/master/get/getCollegeList',
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


  //* step: 2
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

  //* Step : 5
  getExamTypeData() {
    this.http.getParam('/master/get/getExamType', {}, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("examTypeList : ", result);
          this.state.examTypeList = result.body.data;
        },
        (error) => {
          console.error('Error in examTypeList:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }


}
