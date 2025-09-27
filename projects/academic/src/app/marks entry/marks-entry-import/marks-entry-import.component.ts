import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup,  Validators} from '@angular/forms';
import { AlertService, HttpService, PrintService } from 'shared';

@Component({
  selector: 'app-marks-entry-import',
  standalone: false,
  templateUrl: './marks-entry-import.component.html',
  styleUrl: './marks-entry-import.component.scss'
})
export class MarksEntryImportComponent {


  marksImportFormGroup! : FormGroup

  constructor(private fb: FormBuilder,private HTTP :HttpService, private alert: AlertService,){ }

 ngOnInit() {
  this.marksImportFormGroup = this.fb.group({
    file: [null]   
  });
}

// Handle file input
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.marksImportFormGroup.patchValue({ file: file });
    this.marksImportFormGroup.get('file')?.updateValueAndValidity();
  }
}

// Submit to Node.js backend
onSubmit() {
  if (!this.marksImportFormGroup.value.file) {
    this.alert.alertMessage("Please select a file!", "", "warning");
    return;
  }
  // console.log("FormGroup value:", this.marksImportFormGroup.value);
  const formData = new FormData();
  formData.append('file', this.marksImportFormGroup.value.file);

    formData.forEach((val, key) => {
    console.log(key, val);
  });
  
this.HTTP.postFile('/attendance/postFile/importStudentsMarksData', formData, 'academic')
  .subscribe((res: any) => {
    if (res?.success) {
      this.alert.alertMessage(
        `File uploaded successfully! ${res.count} records imported.`,
        "",
        "success"
      );
    } 
  }, (err) => {
    console.error("Upload error:", err);

    let msg = "Upload failed!";
    if (err?.error?.message) {
      msg = err.error.message;
    } else if (err?.status === 413) {
      msg = "File too large! Please upload a smaller file.";
    } else if (err?.status === 400) {
      msg = "Invalid file format or request.";
    } else if (err?.status === 0) {
      msg = "Cannot connect to server. Please try again.";
    }

    this.alert.alertMessage(msg, "", "warning");
  });


}

}
