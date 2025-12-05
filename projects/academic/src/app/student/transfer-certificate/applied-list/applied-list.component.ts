import { Component } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { HttpService } from 'shared';

@Component({
  selector: 'app-applied-list',
  standalone: false,
  templateUrl: './applied-list.component.html',
  styleUrl: './applied-list.component.scss'
})
export class AppliedListComponent {

 transappliedFormGroup!: FormGroup;

  acadmcSession: any[] = [];
  college: any[] = [];
  degreeProgramme: any[] = [];
  behavior: any[] = [];

  student_list: any[] = [];
  isListLoaded = false;

  constructor(
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
    title: 'Transfer Applied List'
  };

  ngOnInit() {
    this.initForm();
    this.getBehavior();
    this.getAcademicSession();
    this.getDegreeProgramme();
    this.getCollege();
  }

  initForm() {
    this.transappliedFormGroup = this.fb.group({
      academic_session: [null, Validators.required],
      degree_programme: [null, Validators.required],
      college: [null, Validators.required]
    });
  }

  getAcademicSession() {
    this.HTTP.getParam('/master/get/getAcademicSession1', {}, 'academic')
      .subscribe((res: any) => {
        this.acadmcSession = res?.body?.data || [];
      });
  }

  getDegreeProgramme() {
    this.HTTP.getParam('/master/get/getDegreePrograamList', {}, 'academic')
      .subscribe((res: any) => {
        this.degreeProgramme = res?.body?.data || [];
      });
  }

  getCollege() {
    this.HTTP.getParam('/master/get/getCollegeList1', {}, 'academic')
      .subscribe((res: any) => {
        this.college = res?.body?.data || [];
      });
  }

  getBehavior() {
    this.behavior = [
      { behavior_id: 'Excellent', behavior_name: 'Excellent' },
      { behavior_id: 'Very Good', behavior_name: 'Very Good' },
      { behavior_id: 'Good', behavior_name: 'Good' },
      { behavior_id: 'Favorable', behavior_name: 'Favorable' },
      { behavior_id: 'Bad', behavior_name: 'Bad' }
    ];
  }

  getAppliedListTransferCertificate() {
    if (this.transappliedFormGroup.invalid) return;

    const formValue = this.transappliedFormGroup.value;

    const params = {
      academic_session_id: formValue.academic_session,
      degree_programme_id: formValue.degree_programme,
      college_id: formValue.college
    };

    this.HTTP.getParam(
      '/course/get/getAppliedListTransferCertificate',
      params,
      'academic'
    ).subscribe((res: any) => {

      // ✅ ADD ROW-WISE FIELDS
      this.student_list = (res?.body?.data || []).map((row: any) => ({
        ...row,
        behavior_id: null,
        remarks: ''
      }));

      this.tableOptions.dataSource = this.student_list;
      this.tableOptions.listLength = this.student_list.length;
      this.isListLoaded = true;
    });
  }

  // ✅ Final payload (row-wise behavior + remarks)
 submitRowWiseData() {

  // ✅ Create payload (row-wise)
  const payload = this.student_list
    .filter(row => row.behavior_id || row.remarks) // optional filter
    .map(row => ({
      student_id: row.student_id,
      behavior_id: row.behavior_id,
      remarks: row.remarks
    }));

  if (payload.length === 0) {
    alert('Please select behavior or enter remarks for at least one student.');
    return;
  }
  console.log('Submitting payload:', payload);
}


}