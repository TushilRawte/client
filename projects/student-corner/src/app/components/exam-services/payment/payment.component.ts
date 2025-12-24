import { Component ,Input } from '@angular/core';
import { environment } from 'environment';
import { HttpService, AlertService } from 'shared';
import { Router ,ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedExamService } from '../../../../../services/shared-exam.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  studentData: any = null;
  paymentData: any = {};
  exam_data_r: any = {};
  totalAmount: number = 0;
  lateFee: number = 0;
  sessionData: any = {};
  curr_acadmc_session: any = [];
  page_title: string = '';
  paymentType:  string = '';
  is_checked: boolean = false;
  path: string = environment.igkvUrl;
  @Input() options: any; 

  constructor(
    private cdr: ChangeDetectorRef,
    private HTTP: HttpService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService,
    private sharedExamService: SharedExamService
  ) {}

  ngOnInit(): void {
    const storedData = sessionStorage.getItem('studentData');
    this.paymentType =this.route.snapshot.paramMap.get('type') ?? ''
    console.log('Payment Type:', this.paymentType);
    switch (this.paymentType) {
      case "reval":
        this.page_title = 'Reval'
        break;

      case "migration":
        this.page_title = 'Migration'
        break;

      case "transfer":
        this.page_title = 'Transfer'
        break;

      default:
        this.router.navigate(['/dashboard']);
        break;
    }
    if (storedData) {
      const studentData = JSON.parse(storedData);
      this.sessionData = studentData;
      this.getStudentDetails();
      this.getAcademicSession();
      if(this.paymentData === 'reval'){
        const examData = this.sharedExamService.getExamData();
        this.exam_data_r = examData;
        console.log('this is data ',this.exam_data_r);
      }
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

    getAcademicSession() {
    const  params = {
      currently_running:'Y'
      }
    this.HTTP.getParam(
      '/master/get/getAcademicSession',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.curr_acadmc_session = !result.body.error ? result.body.data[0] : [];
    });
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
      if(this.paymentType !== 'reval'){
        this.getPaymentDetails('Y');
      }else{
        this.getPaymentDetails();
      }
    });
  }

  getPaymentDetails(is_cert?: string) {
    const isReval = this.paymentType === 'reval';
    const isTransfer = this.paymentType === 'transfer';
    const isMigration = this.paymentType === 'migration';

    const params = {
      college_type_code: this.studentData?.college_type_id,
      academic_session_id: this.studentData?.academic_session_id,
      admission_session: this.studentData?.admission_session,
      college_id: this.studentData?.college_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      degree_id: this.studentData?.degree_id,
      subject_id: this.studentData?.subject_id,
      student_type: this.studentData?.student_fee_category,
      registration_id: this.studentData?.registration_id,
      student_id: this.studentData?.student_id,
      is_cert,
      ...(isReval && {
        link_master_id: 8,
        reval_id: this.exam_data_r?.reval_id,
      }),

      ...(isTransfer && {
        fee_purpose_id: 26,
      }),

      ...(isMigration && {
        fee_purpose_id: 24,
      }),
    };

    this.HTTP.getParam(
      '/course/get/getPaymentDetails/',
      params,
      'academic'
    ).subscribe((result: any) => {
      this.paymentData = !result.body.error ? result.body.data : [];
       this.cdr.detectChanges();
      this.calculateTotalAmount();
    });
  }


  calculateTotalAmount() {
    const fee_amount = this.paymentData?.payData?.fee_amount ?? 0;
    const no_of_subject = this.exam_data_r?.no_of_subject;
    const latefee = this.paymentData?.payData?.latefee ?? 0;``
    this.lateFee = latefee;
    if (no_of_subject != null) {
      this.totalAmount = fee_amount * no_of_subject + latefee;
    } else {
      this.totalAmount = fee_amount + latefee;
    }    
  }

  onCheckChange(e: any) {
    this.is_checked = e.checked;
  }

  applyForTransferMigrationCert(): Promise<void> {
    
    return new Promise((resolve, reject) => {

      let original_duplicate = 'O';
      if (
        this.paymentData?.certificateData &&
        this.paymentData?.certificateData?.original_duplicate === 'O'
      ) {
        original_duplicate = 'D';
      }

      const params = {
        ue_id: this.sessionData?.ue_id,
        student_id: this.studentData?.student_id,
        apply_academic_session_id: this.curr_acadmc_session?.academic_session_id,
        original_duplicate: original_duplicate,
        admission_session: this.studentData?.admission_session,
        degree_programme_id: this.studentData?.degree_programme_id,
        course_year_id: this.studentData?.course_year_id,
        semester_id: this.studentData?.semester_id,
        last_session_id: this.sessionData?.academic_session_id,
        paymentType:this.paymentType,     
      };

      console.log('data for tc', params);

      this.HTTP.postData('/course/post/applyForTransferMigrationCert/',params,'academic').subscribe({next: (result: any) => {
          console.log( 'tushil',result);
          
          if(result?.data?.error){
            console.log('i am called',result?.data?.error);    
          }
          resolve();
        },
        error: (err) => {
          // ✅ HTTP / NETWORK ERROR
          reject({
            message: 'Server error occurred while applying transfer'
          });
        }
      }
    );
    });
  }

  async onPayClicked() {
    const result = await Swal.fire({
      title: 'Proceed to Payment?',
      text: 'Do you want to continue with the payment?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay Now',
      cancelButtonText: 'No, Cancel',
    });

    if (result.isConfirmed) {
      try {
        if (this.paymentType !== 'reval') {
          await this.applyForTransferMigrationCert(); 
        }
        this.makePayment();
      } catch (error) {
        Swal.fire('Error', 'Transfer failed', 'error');
      }
    }
  }

  onPrintClicked() {
    const sanitizedDegreeName = this.studentData?.degree_programme_name_e?.replace(/\s+/g, '_') || 'Receipt';
    const fileName = `${sanitizedDegreeName}_${new Date().getFullYear()}_${this.formatDate(new Date())}.pdf`;
    const params = {
      academic_session_id: this.studentData?.academic_session_id,
      course_year_id: this.studentData?.course_year_id,
      semester_id: this.studentData?.semester_id,
      college_id: this.studentData?.college_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      ue_id: this.sessionData?.ue_id,
      payee_id: this.studentData?.payment_id,
      appliedsession: this.exam_data_r?.appliedAcademic,
      appliedsemesterid: this.exam_data_r?.appliedSemester,
      orientation: this.options?.orientation || 'portrait'
    };
    this.HTTP.postBlob(
      `/file/post/feeReceiptPdf`,
      {
      ...params,
      orientation: this.options?.orientation || 'portrait'
      },
      fileName,
      "academic"
    )
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          const blob = response?.body;
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
          } else {
            this.alert.alertMessage("No Records Found!", "Failed to download report.", "error");
            console.log(response);
            
          }
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.alert.alertMessage("Something went wrong!", "Failed to download report. Please try again later.", "error");
        }
      });
  }


  makePayment_old() {
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

  makePayment() {
    const payload = this.payloadForPay();
    console.log('🟢 Sending Payment Payload:', payload);

    this.HTTP.postData(
      '/course/post/saveStudenTransactionPayeeDetail',
      payload,
      'academic'
    ).subscribe({
      next: (res: any) => {
        console.log('🔍 Full API Response:', res);

        // ✅ Your actual data path is res.body.data.payment
        const data = res?.body?.data?.payment;
        console.log('📦 Extracted Payment Data:', data);

        if (data?.order_id && data?.key && data?.amount) {
          this.openRazorpayCheckout(data);
        } else {
          Swal.fire('Error', 'Payment could not be initiated', 'error');
        }
      },
      error: (err) => {
        console.error('❌ HTTP Error:', err);
        Swal.fire('Error', 'Server not reachable or failed.', 'error');
      },
    });
  }

   private formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }


  private openRazorpayCheckout(data: any) {
    const options: any = {
      key: data?.key, // Razorpay key_id
      amount: data?.amount, // in paise
      currency: 'INR',
      name: 'Indira Gandhi Krishi Vishwavidyalaya',
      description: data?.fee_purpose_name,
      image: 'projects/shared/assets/other/logo.png', // optional
      order_id: data.order_id, // from backend
      handler: (response: any) => {
        console.log('✅ Razorpay Payment Success:', response);
        this.verifyPayment(response, data);
      },
      prefill: {
        name: data?.name,
        email: data?.email,
        contact: '7582077856',
      },
      notes: {
        purpose: data?.purpose,
        refNo: data?.receipt,
      },
      // theme: {
      //   color: '#198754', // your green theme color
      // },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      console.error('❌ Payment Failed:', response.error);

      Swal.fire(
        'Payment Failed',
        response.error.description || 'Transaction failed.',
        'error'
      );

      // Optional: Log failure to backend
      const failurePayload = {
        order_id: response.error?.metadata?.order_id,
        payment_id: response.error?.metadata?.payment_id,
        reason: response.error?.reason,
        description: response.error?.description,
        code: response.error?.code,
        step: response.error?.step,
        source: response.error?.source,
        refNo: data?.receipt,
      };


      this.HTTP.postData(
        '/course/post/razorpayPaymentFailed',
        failurePayload,
        'academic'
      ).subscribe({
        next: (res: any) => console.log('📝 Payment failure logged:', res),
        error: (err) => console.error('⚠️ Failed to log payment failure:', err),
      });
    });

    rzp.open();
  }

  private verifyPayment(paymentResponse: any, data: any) {
    const payload = {
      razorpay_order_id: paymentResponse?.razorpay_order_id,
      razorpay_payment_id: paymentResponse?.razorpay_payment_id,
      razorpay_signature: paymentResponse?.razorpay_signature,
      refNo: data?.receipt,
    };

    this.HTTP.postData(
      '/course/post/razorpayPaymentVerify',
      payload,
      'academic'
    ).subscribe({
      next: (res: any) => {
        console.log('🔍 Full verify response:', res);

        const data = res?.body?.data || res?.data || res;

        if (data?.success) {
          Swal.fire(
            '✅ Success',
            data.message || 'Payment Verified Successfully!',
            'success'
          );
          if (this.paymentType !== 'reval') {
            this.getPaymentDetails('Y');
          } else {
            this.getPaymentDetails();
          }
        } else {
          Swal.fire(
            '⚠️ Verification Failed',
            data?.message || 'Could not verify payment.',
            'warning'
          );
        }
      },
      error: (err) => {
        console.error('❌ Verification Error:', err);
        Swal.fire('Error', 'Server not reachable for verification.', 'error');
      },
    });
  }
  
  private payloadForPay() {
    const payee_detail = {
      college_id: this.studentData?.college_id,
      payee_id: this.studentData?.payment_id,
      registration_id:this.studentData?.registration_id,
      reval_id: this.exam_data_r?.reval_id,
      category: this.studentData?.basic_category_id,
      purpose_id: this.paymentData?.payData?.fee_purpose_id,
      fee_purpose_name: this.paymentData?.payData?.fee_purpose_name,
      current_course_year_id: this.studentData?.course_year_id,
      current_semester_id: this.studentData?.semester_id,
      academic_session_code: this.studentData?.academic_session_id,
      applied_session: this.exam_data_r?.appliedAcademic ?? this.curr_acadmc_session?.academic_session_id,
      applied_course_year_id: this.exam_data_r?.appliedCourseYear,
      applied_semester_id: this.exam_data_r?.appliedSemester,
      subject_id: this.studentData?.subject_id,
      faculty_id: this.studentData?.faculty_id,
      degree_programme_id: this.studentData?.degree_programme_id,
      sponsor_student: this.studentData?.sponser_candidate_yn,
      counseling_series_master_code:
        this.studentData?.counseling_series_master_code,
      admsn_quota_id: this.studentData?.admsn_quota_id,
      entrance_exam_type_code: this.studentData?.entrance_exam_type_code,
      conveniencefee: this.studentData?.convenienceFee,
      payee_name: this.studentData?.student_name,
      email: this.studentData?.email_id,
      mobile: this.studentData?.mobile_no,
      // batch_academic_session_id : this.studentData?.batch_academic_session_id,
      // batch_semester_id : this.studentData?.batch_semester_id,
    };

    const payee_sub_detail = {
      fee_id: this.paymentData?.payData?.fee_id,
      amount: this.paymentData?.payData?.fee_amount,
      fee_status: this.paymentData?.payData?.fee_status,
      no_of_subject: this.exam_data_r?.no_of_subject,
      latefee: this.lateFee,
      total: this.totalAmount,
    };

    return { payee_detail, payee_sub_detail };
  }
} 
