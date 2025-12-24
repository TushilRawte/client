import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { AlertService, EsignService, HttpService, LoaderService, PrintService } from 'shared';
import { environment, apiPort } from 'environment';

@Component({
  selector: 'app-pdc-esign',
  standalone: false,
  templateUrl: './pdc-esign.component.html',
  styleUrl: './pdc-esign.component.scss'
})
export class PdcEsignComponent implements OnInit {
  getSRCDetailsForm!: FormGroup;
  studentDetails: any = null;
  // file_prefix: string = environment.filePrefix;
  file_prefix: string = apiPort.fileUrl;
  degree_id: number = 0;
  selectAll: boolean = true;
  state = {
    academicSessionList: [] as any,
    degreeProgrammeList: [] as any,
    collegeList: [] as any
  }
  generatePDCFormGroup!: FormGroup;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private alert: AlertService,
    public print: PrintService,
    public esign: EsignService,
    private loaderService: LoaderService
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
    title: "Student Details"
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

  getPDCList_Btn_click(actionType: string) {
    // console.log("Form Value:", this.getSRCDetailsForm.value);
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
      this.http.getParam('/studentProfile/get/getStudentListForPDC',
        { ...params, pdc_gen_yn: 'N' },
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
              this.createGeneratePDCForm(data);
            }
          },
          (error) => {
            console.error('Error in getStudentListForPDC:', error);
            this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
          }
        );
    }
  }

  private createGeneratePDCForm(data: any[]) {
    this.generatePDCFormGroup = this.fb.group({
      studentRows: this.fb.array([])
    });

    const control = this.generatePDCFormGroup.get('studentRows') as any;

    data.forEach((row, index) => {
      const isDisabled =
        !(row.pdc_gen_yn === 'Y' && row.is_certificate_signed !== 'Y');

      const isSelected = !isDisabled;  // auto-select only enabled rows
      control.push(
        this.fb.group({
          formIndex: index,
          // selected = true only when NOT esigned
          selected: [{ value: isSelected, disabled: isDisabled }],
          student_id: [row.student_id],
          ue_id: [row.ue_id],
          pdc_gen_yn: [row.pdc_gen_yn],
          pdc_required: [row.pdc_required],
          degree_completed_session: [row.degree_completed_session],
          admission_session: [row.admission_session],
          certificate_id: [row.certificate_id],
          certificate_number: [row.certificate_number],
          file_path: [row.file_path],
          file_name: [row.file_path],
        })
      );
    });
  }

  get studentRowsFormArray() {
    return this.generatePDCFormGroup.get('studentRows') as any;
  }

  getPDC(row: any) {
    // console.log("row ====dds>> ", row);
    let { student_id } = row;
    let srcTitle = `Provisional_Degree_Certificate_${student_id}`
    this.http.postBlob(`/file/post/provisionalDegreeCertificatePdf`, {
      // orientation: 'landscape'
      ue_id: student_id,
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

  async esignPDC_btn() {
    const selectedRows = this.studentRowsFormArray.value.filter((r: any) => r.selected);

    if (selectedRows.length === 0) {
      this.alert.alertMessage("No Selection", "Please select at least one student OR Generate first PDC", "error");
      return;
    }

    // console.log("Selected students:", selectedRows);
    let { academic_session_id, degree_programme_id, college_id, ue_id } = this.getSRCDetailsForm.value

    let selectedDegreePro = this.state.degreeProgrammeList.filter((degreePro: any) => degreePro.degree_programme_id === degree_programme_id);
    // console.log("selectedDegreePro ===>> ", selectedDegreePro);


    // ! start------------------ esign call -------------------------------------------------------
    // moduleid => PDC = 29
    // ✅ Run setup ONCE before all colleges
    await this.esign.setupEDS(29); // moduleid from table dsc_modules

    // Wait for all callEsignService() calls to complete
    this.loaderService.show();
    let selectedstudents: any = await Promise.all(
      selectedRows.map(async (student: any) => {
        const filePath = await this.esign.callEsignService(this.file_prefix + student.file_path);
        return {
          ue_id: student.ue_id,
          degree_id: selectedDegreePro[0]?.degree_id,
          degree_programme_type_id: selectedDegreePro[0]?.degree_programme_type_id,
          degree_programme_id: degree_programme_id,
          academic_session_id: academic_session_id,
          degree_completed_session: student.degree_completed_session,
          college_id: college_id,
          certificate_number: student.certificate_number,
          file_path: filePath,
          file_name: student.file_path,
          student_id: student.student_id,
          pdc_gen_yn: student.pdc_gen_yn,
          certificate_id: student.certificate_id,
        };
      })
    );
    this.loaderService.hide();
    this.esign.resetEsignState();
    // ! ------------------ esign call ---------------------------------------------------------end

    // console.log("selectedstudents ===> ", selectedstudents);
    // const formData = new FormData();
    // formData.append("students", selectedstudents);
    this.http.postData('/studentProfile/post/pdcEsign', { students: selectedstudents }, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("pdcEsign====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "PDC E-Sign Done.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getPDCList_Btn_click('show'); //^ reload page
        },
        (error) => {
          console.error('Error in pdcEsign:', error);
          this.alert.alertMessage("Something went wrong!", "Network error occurred", "error");
        });
  }

  async deletePDC_btn(row: any) {
    // Show confirmation dialog
    const result = await this.alert.confirmAlert(
      "Are you sure you want to delete this PDC?",
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
    this.http.deleteData('/studentProfile/delete/deletePDC', payload, 'academic')
      .subscribe(
        (result: any) => {
          // console.log("deletePDC====<<<<S : ", result?.body);
          if (result?.body?.data?.message) {
            this.alert.alertMessage(result.body.data.message || "PDC Deleted.", "", "success")
          } else if (result?.body?.error?.message) {
            this.alert.alertMessage(result.body.error.message || "Something went wrong!", "", "error");
          } else if (result?.body?.error) {
            this.alert.alertMessage(result?.body?.error || "", "", "error");
          } else {
            this.alert.alertMessage("Something went wrong!", "Please try again latter", "error")
          }
          this.getPDCList_Btn_click('show'); //^ reload page
        },
        (error) => {
          console.error('Error in deletePDC:', error);
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
