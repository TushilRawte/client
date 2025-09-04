// import {Component, OnInit} from '@angular/core';
// import {HttpService} from "shared";
// import {FormBuilder, FormGroup, Validators} from "@angular/forms";
// import { MatCard, MatCardContent } from "@angular/material/card";
// import { MatFormField, MatLabel } from "@angular/material/form-field";

// @Component({
//   selector: 'app-serverquery',
//   templateUrl: './serverquery.component.html',
//   styleUrl: './serverquery.component.scss',
//   imports: [MatCard, MatCardContent, MatFormField, MatLabel]
// })
// export class ServerqueryComponent implements OnInit {
//   basicForm: FormGroup;
//   results: any = []

//   constructor(private http: HttpService, private fb: FormBuilder) {
//     this.basicForm = this.fb.group({
//       query: ["", Validators.required],
//     })
//   }

//   ngOnInit(): void {
//   }

//   runQuery() {
//     this.results = []
//     if (this.basicForm.invalid) {
//       this.basicForm.markAsUntouched()
//       return
//     }
//     this.http.postData("", this.basicForm.value, "fetch").subscribe(res => {

//     })
//   }
// }



// import { Component, OnInit } from '@angular/core';
// import { HttpService } from "shared";
// import { FormBuilder, FormGroup, Validators } from "@angular/forms";
// import { MatCard, MatCardContent } from "@angular/material/card";
// import { MatFormField, MatLabel } from "@angular/material/form-field";

// @Component({
//   selector: 'app-serverquery',
//   templateUrl: './serverquery.component.html',
//   styleUrls: ['./serverquery.component.scss'], // ❗ Should be `styleUrls` not `styleUrl`
//   standalone: true, // ❗ Required if using `imports` in @Component
//   imports: [MatCard, MatCardContent, MatFormField, MatLabel]
// })
// export class ServerqueryComponent implements OnInit {
//   basicForm: FormGroup;
//   results: any = [];

//   constructor(private http: HttpService, private fb: FormBuilder) {
//     this.basicForm = this.fb.group({
//       query: ["", Validators.required],
//     });
//   }

//   ngOnInit(): void {}

//   runQuery() {
//     this.results = [];
//     if (this.basicForm.invalid) {
//       this.basicForm.markAsUntouched();
//       return;
//     }
//     this.http.postData("", this.basicForm.value, "fetch").subscribe(res => {
//       this.results = res;
//     });
//   }
// }



import { Component, OnInit } from '@angular/core';
import { HttpService } from 'shared';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // ✅ Add ReactiveFormsModule
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // ✅ Needed for matInput
import { MatButtonModule } from '@angular/material/button'; // ✅ Needed for mat-flat-button

@Component({
  selector: 'app-serverquery',
  standalone: true,
  templateUrl: './serverquery.component.html',
  styleUrls: ['./serverquery.component.scss'],
  imports: [
    ReactiveFormsModule, // ✅ Add this
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInputModule,      // ✅ Required for <textarea matInput>
    MatButtonModule      // ✅ Required for <button mat-flat-button>
  ]
})
export class ServerqueryComponent implements OnInit {
  basicForm: FormGroup;
  results: any = [];

  constructor(private http: HttpService, private fb: FormBuilder) {
    this.basicForm = this.fb.group({
      query: ["", Validators.required],
    });
  }

  ngOnInit(): void {}

  runQuery() {
    this.results = [];
    if (this.basicForm.invalid) {
      this.basicForm.markAsUntouched();
      return;
    }
    this.http.postData("", this.basicForm.value, "fetch").subscribe(res => {
      this.results = res;
    });
  }
}

