import { Component } from '@angular/core';
import { environment } from 'environment';
import { HttpService ,AlertService } from 'shared';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedExamService } from '../../../../../services/shared-exam.service';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  studentData: any = {};
  paymentData: any = {};
  exam_data_r: any = {};
  totalAmount: number = 0;
  lateFee: number = 0;
  sessionData: any = {};
  path: string = environment.igkvUrl;

  constructor(
    private HTTP: HttpService,
    private router: Router,
    private alert: AlertService,
    private sharedExamService: SharedExamService
  ) {}

  ngOnInit(): void {
    const storedData = sessionStorage.getItem('studentData');
    if (storedData) {
      const studentData = JSON.parse(storedData);
      this.sessionData = studentData;
      this.getStudentDetails();
      const examData = this.sharedExamService.getExamData();
      if (examData) {
        this.exam_data_r = examData;
      }
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = this.sessionData?.academic_session_id;
    const course_year_id = this.sessionData?.course_year_id;
    const semester_id = this.sessionData?.semester_id;
    const college_id = this.sessionData?.college_id;
    const degree_programme_id = this.sessionData?.degree_programme_id;
    const ue_id = this.sessionData?.ue_id;

    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id,
      payment: true,
    };
    this.HTTP.getParam(
      '/course/get/getStudentList/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.studentData = !result.body.error ? result.body.data[0] : [];
      this.getPaymentDetails();
    });
  }

  getPaymentDetails() {
    const params = {
      college_type_code: this.studentData?.college_type_id,
      link_master_id: 8,
      academic_session_id: this.studentData?.academic_session_id,
      college_id: this.studentData?.college_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      degree_id: this.studentData?.degree_id,
      subject_id: this.studentData?.subject_id,
      student_type: this.studentData?.student_fee_category,
    };

    this.HTTP.getParam(
      '/course/get/getPaymentDetails/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.paymentData = !result.body.error ? result.body.data[0] : [];
      this.calculateTotalAmount();
    });
  }

  calculateTotalAmount() {
    const fee_amount = this.paymentData?.fee_amount ?? 0;
    const no_of_subject = this.exam_data_r?.no_of_subject;
    const latefee = this.paymentData?.latefee ?? 0;
    this.lateFee = latefee;
    if (no_of_subject != null) {
      this.totalAmount = fee_amount * no_of_subject + latefee;
    } else {
      this.totalAmount = fee_amount + latefee;
    }
  }

  onPayClicked() {
    Swal.fire({
      title: 'Proceed to Payment?',
      text: 'Do you want to continue with the payment for selected courses?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay Now',
      cancelButtonText: 'No, Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.makePayment();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Payment process was cancelled.', 'info');
      }
    });
  }

  makePayment() {
    const payload = this.payloadForPay();
    this.HTTP.postData(
      '/course/post/saveStudenTransactionPayeeDetail',
      payload,
      'academic'
    ).subscribe((res: any) => {
      if (!res.body.error) {
        Swal.fire('Submitted!', 'Your data has been submitted.', 'success');
      } else {
        this.alert.alertMessage(
          'Something went wrong!',
          res.body.error?.message,
          'warning'
        );
      }
    });
  }

  private payloadForPay() {
    const payee_detail = {
      college_id: this.studentData?.college_id,
      payee_id: this.studentData?.payment_id,
      category: this.studentData?.basic_category_id,
      purpose_id: this.paymentData?.fee_purpose_id,
      current_course_year_id: this.studentData?.course_year_id,
      current_semester_id: this.studentData?.semester_id,
      academic_session_code: this.studentData?.academic_session_id,
      applied_session: this.exam_data_r?.appliedAcademic,
      applied_course_year_id: this.exam_data_r?.appliedCourseYear,
      applied_semester_id: this.exam_data_r?.appliedSemester,
      subject_id: this.studentData?.subject_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      sponsor_student: this.studentData?.sponser_candidate_yn,
      counseling_series_master_code:
        this.studentData?.counseling_series_master_code,
      admsn_quota_id: this.studentData?.admsn_quota_id,
      entrance_exam_type_code: this.studentData?.entrance_exam_type_code,
      conveniencefee: this.studentData?.convenienceFee,
      // batch_academic_session_id : this.studentData?.batch_academic_session_id,
      // batch_semester_id : this.studentData?.batch_semester_id,
    };

    const payee_sub_detail = {
      fee_id: this.paymentData?.fee_id,
      amount: this.paymentData?.fee_amount,
      fee_status: this.paymentData?.fee_status,
      no_of_subject: this.exam_data_r?.no_of_subject,
      latefee: this.lateFee,
      total: this.totalAmount,
    };

    return { payee_detail, payee_sub_detail };
  }
}
