import { Component } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { HttpService,  } from 'shared';

@Component({
  selector: 'app-payment-settlement',
  standalone: false,
  templateUrl: './payment-settlement.component.html',
  styleUrl: './payment-settlement.component.scss'
})
export class PaymentSettlementComponent {

 uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploading = false;
  responseMessage = '';
  transactionData: any[] = [];
  displayedColumns: string[] = [];

  constructor(private fb: FormBuilder, private HTTP: HttpService) {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required]
    });
  }

  // Handle file selection
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowed = ['.xlsx', '.xls', '.zip'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowed.includes(ext)) {
        this.responseMessage = '❌ Only Excel (.xlsx, .xls) or ZIP files are allowed.';
        this.uploadForm.get('file')?.reset();
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.responseMessage = '';

      // ✅ Update the form control and mark as valid
      this.uploadForm.patchValue({ file });
      this.uploadForm.get('file')?.updateValueAndValidity();
    }
  }

  // Handle upload
onUpload() {
  if (!this.uploadForm.valid || !this.selectedFile) return;

  this.uploading = true;
  this.uploadProgress = 0;
  this.responseMessage = '';

  const formData = new FormData();
  formData.append('file', this.selectedFile);

  this.HTTP.postFile('/course/postFile/importPaymentSettlement', formData, 'academic').subscribe({
    next: (event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } 
    else if (event.type === HttpEventType.Response) {
  this.uploading = false;
  const res = event.body || event;

  console.log('📦 Full server response:', res);

  let previewData = [];

  if (Array.isArray(res?.preview)) {
    previewData = res.preview;
  } 
  else if (Array.isArray(res?.data?.preview)) {
    previewData = res.data.preview;
  } 
  else if (Array.isArray(res?.data)) {
    previewData = res.data;
  }

  console.log('📊 PreviewData (after check):', previewData);

  this.transactionData = previewData.map((item:any) => JSON.parse(JSON.stringify(item)));
  console.log("✅ this is student data", this.transactionData);

  this.displayedColumns = this.transactionData.length > 0
    ? Object.keys(this.transactionData[0])
    : [];
  console.log("✅ displayed columns", this.displayedColumns);
}

    },
    error: (err) => {
      this.uploading = false;
      this.responseMessage = err.error?.message || '❌ Upload failed.';
    }
  });
}


}