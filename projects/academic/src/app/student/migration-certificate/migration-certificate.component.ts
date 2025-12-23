import { Component } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from 'shared';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-migration-certificate',
  standalone: false,
  templateUrl: './migration-certificate.component.html',
  styleUrl: './migration-certificate.component.scss'
})
export class MigrationCertificateComponent {

 migrationFormGroup!: FormGroup;

  acadmcSession: any[] = [];
  college: any[] = [];
  degreeProgramme: any[] = [];
  behavior: any[] = [];

  student_list: any[] = [];
  selected_student_list: any[] = [];
  isListLoaded: boolean = false;
  isListData: boolean = true;
  isUe_idData: boolean = true;
  showApplied!: boolean ;
  showApprGenr!: boolean ;

  constructor(
    private snackBar: MatSnackBar,
    private HTTP: HttpService,
    private fb: FormBuilder
  ) {}

  tableOptions: any = {
    is_read: true,
    listLength: 0,
    dataSource: [],
    button: [],
    is_filter: false,
    page: 0,
    pageSize: 20,
    is_pagination: false,
    title: 'Transfer Applied List',
  };

  ngOnInit() {
    this.initForm();
    this.getBehavior();
    this.getAcademicSession();
    this.getDegreeProgramme();
    this.getCollege();
  }

  initForm() {
    this.migrationFormGroup = this.fb.group({
      academic_session: [null, Validators.required],
      degree_programme: [null, Validators.required],
      college: [null, Validators.required],
    });
  }

  getAcademicSession() {
    this.HTTP.getParam(
      '/master/get/getAcademicSession',
      {},
      'academic'
    ).subscribe((res: any) => {
      this.acadmcSession = res?.body?.data || [];
    });
  }

  getDegreeProgramme() {
    this.HTTP.getParam(
      '/master/get/getDegreeProgramme',
      {},
      'academic'
    ).subscribe((res: any) => {
      this.degreeProgramme = res?.body?.data || [];
    });
  }

  getCollege() {
    this.HTTP.getParam('/master/get/getCollegeList', {}, 'academic').subscribe(
      (res: any) => {
        this.college = res?.body?.data || [];
      }
    );
  }

  getBehavior() {
    this.behavior = [
      { behavior_id: 'Excellent', behavior_name: 'Excellent' },
      { behavior_id: 'Very Good', behavior_name: 'Very Good' },
      { behavior_id: 'Good', behavior_name: 'Good' },
      { behavior_id: 'Favorable', behavior_name: 'Favorable' },
      { behavior_id: 'Bad', behavior_name: 'Bad' },
    ];
  }

  getAppliedListTransferCertificate(appr_gen:string,ue_id?: number) {
    const formValue = this.migrationFormGroup.value;
    let is_approved ,is_generated;
    if(appr_gen === 'Y'){
      is_approved = 1;
      is_generated = 1;
      this.showApplied = true;
      this.showApprGenr = false;
    }else{
      is_approved = 0;
      is_generated = 0;
      this.showApprGenr = true;
      this.showApprGenr = true;
    }

    const params: any = {
      academic_session_id: formValue?.academic_session,
      degree_programme_id: formValue?.degree_programme,
      college_id: formValue?.college,
      is_approved: is_approved,
      is_generated: is_generated,
       ...(ue_id != null && { ue_id: Number(ue_id) }),
    };

    this.HTTP.getParam(
      '/course/get/getAppliedListTransferCertificate',
      params,
      'academic'
    ).subscribe((result: any) => {
      console.log('result', result.body);

      //  this.student_list = !result.body.error ? result.body.data : [];
      this.student_list = !result.body.error
        ? result.body.data.map((row: any) => ({
            ...row,
            isEditing: !(row.behavior && row.remark),
            isUpdated: !!(row.behavior && row.remark),
            isChecked: false
          }))
        : [];

      this.tableOptions.dataSource = this.student_list;
      this.tableOptions.listLength = this.student_list.length;
      this.isListLoaded = true;
    });
  }

  /* ^^ */
  getStudentByUE_ID() {
    this.isListData = false;
    this.student_list = []
  }
  enableEdit(row: any) {
    row.isEditing = true;
  }
  getStudentByList() {
    this.isListData = true;
    this.student_list = []
  }

  onAcademicChange(selectedValue: any) {
    this.isUe_idData = false;
  }


hasAtLeastOneChecked(): boolean {
  return this.student_list?.some(row => row.isChecked === true);
}


onRowCheck(row: any, event: any) {
  row.isChecked = event.checked;
  this.selected_student_list.push(row);
}


  updateRemarkBehavior(row: any) {

    if (!row.behavior || !row.remark) {
      this.snackBar.open('Please fill Remark and Behavior', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      student_id: row.student_id,
      behavior_id: row.behavior,
      remark: row.remark,
    };

    this.HTTP.putData(
      '/course/update/updateRemarkBehaviorTransferCertificate',
      payload,
      'academic'
    ).subscribe((res: any) => {

      if (!res.body?.error) {
        row.isEditing = false;
        row.isUpdated = true;   // ✅ ENABLE CHECKBOX
        Swal.fire('Updated!', 'Successfully saved', 'success');
      }

    });
  }


  approved_generate() {
    const payload = this.selected_student_list
    console.log(this.selected_student_list);
     this.HTTP.putData(
      '/course/update/approveGenerateTransferCertificate',
      payload,
      'academic'
    ).subscribe((res: any) => { 
       
    if (res.body?.error) {
      Swal.fire('Error', res.body.error, 'error');
    } else {
      Swal.fire('Approve & Generate!', 'Successfully saved', 'success');
      this.getAppliedListTransferCertificate('N');
    }
       
    })
  }
}
