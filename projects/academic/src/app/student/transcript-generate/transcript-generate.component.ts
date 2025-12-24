import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environment';
import { take } from 'rxjs';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-transcript-generate',
  standalone: false,
  templateUrl: './transcript-generate.component.html',
  styleUrl: './transcript-generate.component.scss'
})
export class TranscriptGenerateComponent implements OnInit {
  getSRCDetailsForm!: FormGroup;
  studentDetails: any = null;
  file_prefix: string = environment.filePrefix;
  // file_prefix: string = apiPort.fileUrl;
  degree_id: number = 0;
  selectAll: boolean = true;
  state = {
    academicSessionList: [] as any,
    degreeProgrammeList: [] as any,
    collegeList: [] as any
  }
  generateTrascriptFormGroup!: FormGroup;

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
    title: "Student List"
  };

  createForm() {
    this.getSRCDetailsForm = this.fb.group({
      academic_session_id: ['', Validators.required],
      degree_programme_id: ['', Validators.required],
      college_id: ['', Validators.required],
      ue_id: [''],
      selected: ['']
    });
  }

  onToggleSelectAll(checked: boolean) {
    this.selectAll = checked;
    const rows = this.studentRowsFormArray.controls;
    rows.forEach((row: any) => row.get('selected').setValue(checked));
  }

  getStudentList_Btn_click(actionType: string) {
    this.getStudentListOptions.dataSource = [];
    this.getStudentListOptions.listLength = 0;
    // console.log("Form Value:", this.getSRCDetailsForm.value);
    // let { student_id } = this.getSRCDetailsForm.value;
    if (actionType === 'refresh') {
      this.getSRCDetailsForm.reset();
      // clear old data
      this.getStudentListOptions.dataSource = [];
      this.getStudentListOptions.listLength = 0;
    }
    if (actionType === 'show') {
      let { academic_session_id, degree_programme_id, college_id, ue_id } = this.getSRCDetailsForm.value
      let params;

      if (ue_id) {
        // Search by UE ID only
        params = { ue_id: ue_id.trim() };
      } else {
        // Validate required fields
        if (!academic_session_id || !degree_programme_id || !college_id) {
          return this.alert.alertMessage("All Fields are Required", "", "warning");
        }

        // Search by session + program + college
        params = {
          academic_session_id,
          degree_programme_id,
          college_id,
        };
      }

      // call API to get data
      this.http.getParam('/studentProfile/get/getStudentListForTranscript',
        { ...params, transcript_gen_yn: 'N' },
        'academic')
        .subscribe(
          (result: any) => {
            // console.log("getStudentListForTranscript result?.body==> ", result?.body);
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
              this.createGenerateTrascriptForm(data);
            }
          },
          (error) => {
            console.error('Error in getStudentListForTranscript:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  private createGenerateTrascriptForm(data: any[]) {
    this.generateTrascriptFormGroup = this.fb.group({
      studentRows: this.fb.array([])
    });

    const control = this.generateTrascriptFormGroup.get('studentRows') as any;

    data.forEach((row, index) => {
      control.push(
        this.fb.group({
          formIndex: index,
          // selected = true only when NOT generated
          selected: [{
            value: row.transcript_gen_yn !== 'Y',
            disabled: row.transcript_gen_yn === 'Y'
          }],
          student_id: [row.student_id],
          ue_id: [row.ue_id],
          transcript_gen_yn: [row.transcript_gen_yn],
          trascript_required: [row.trascript_required],
          degree_completed_session: [row.degree_completed_session],
          certificate_id: [row.certificate_id],
        })
      );
    });
  }

  get studentRowsFormArray() {
    return this.generateTrascriptFormGroup.get('studentRows') as any;
  }

  getTrascript(row: any) {
    // console.log("row ====dds>> ", row);
    let { ue_id, degree_programme_id } = row;
    let srcTitle = `Transcript_Certificate_${ue_id}`
    this.http.postBlob(`/file/post/transcriptPdf`, {
      // orientation: 'landscape'
      ue_id: ue_id,
      degree_programme_id: degree_programme_id
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

  generateTranscript_btn() {
    const selectedRows = this.studentRowsFormArray.value.filter((r: any) => r.selected);
    // console.log("selectedRows ==sd=d==> ", selectedRows);

    if (selectedRows.length === 0) {
      this.alert.alertMessage("No Selection", "Please select at least one student.", "error");
      return;
    }
    let { academic_session_id, degree_programme_id, college_id, ue_id } = this.getSRCDetailsForm.value

    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);
    // console.log("selectedDegreePro ===>> ", selectedDegreePro);

    this.http.postData('/studentProfile/post/generateTranscript', {
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
          // console.log("generateTrascript====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Trascript Generated.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getStudentList_Btn_click('show'); //^ reload page
        },
        (error) => {
          console.error('Error in generateTrascript:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  async deleteTranscript_btn(row: any) {
    // console.log("row ==>>> ", row);
    // Show confirmation dialog
    const result = await this.alert.confirmAlert(
      "Are you sure you want to delete this Trascript?",
      '',
      "question"
    );
    // result.value is true if user confirmed
    if (!result.value) {
      // User clicked "No" or dismissed the modal
      return;
    }
    // delete operation
    let { academic_session_id, degree_programme_id, college_id, ue_id } = this.getSRCDetailsForm.value
    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);
    let payload = {
      academic_session_id: academic_session_id,
      degree_programme_id: degree_programme_id,
      college_id: college_id,
      degree_id: selectedDegreePro[0]?.degree_id,
      degree_programme_type_id: selectedDegreePro[0]?.degree_programme_type_id,
      ue_id: ue_id,
      students: JSON.stringify([row])
    }
    this.http.deleteData('/studentProfile/delete/deleteTranscript', payload, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("deleteTranscript====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "Trascript Deleted.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getStudentList_Btn_click('show'); //^ reload page
        },
        (error) => {
          console.error('Error in deleteTranscript:', error);
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

}
