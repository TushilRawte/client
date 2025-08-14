import { Component } from '@angular/core';
import { PrintService,PrintreportService } from 'shared';

@Component({
  selector: 'app-registration-card',
  standalone: false,
  templateUrl: './registration-card.component.html',
  styleUrl: './registration-card.component.scss'
})
export class RegistrationCardComponent {
 
  constructor(public print: PrintService,public print1 :PrintreportService) {}

   registrationData = [
  {
    academicYear: '2017-18',
    year: 'IV Year',
    semester: 'II Semester',
    status: 'Regular',
    studentType: 'Continuing Student',
    registrationStatus: 'Registered',
    downloadLink: '#'
  },
  {
    academicYear: '2017-18',
    year: 'IV Year',
    semester: 'I Semester',
    status: 'Regular',
    studentType: 'Continuing Student',
    registrationStatus: 'Registered',
    downloadLink: '#'
  },
  {
    academicYear: '2016-17',
    year: 'III Year',
    semester: 'II Semester',
    status: 'Academic Probation',
    studentType: 'Continuing Student',
    registrationStatus: 'Registered',
    downloadLink: '#'
  },
  {
    academicYear: '2016-17',
    year: 'III Year',
    semester: 'I Semester',
    status: 'Academic Probation',
    studentType: 'Continuing Student',
    registrationStatus: 'Registered',
    downloadLink: '#'
  }
  ];

   studentData = {
    registrationNo: "240744",
    studentName: "MANGEE",
    phoneNo: "6268480118",
    registrationSession: "2022-23",
    yearClass: "III Year",
    cumulativeSemesterNo: "6",
    studentUBId: "21012021821",
    semester: "II Semester",
    academicSession: "2024-25"
  };

  feesData = [
    {
      fee: "Semester Examination Fee",
      feeReceiptNo: "243",
      feePaidDate: "",
      transactionNo: "1724100",
      paidAmount: "",
      feePaidCollege: "College of Forestry, Sankra Patan"
    }
  ];

  courseData = [
    { sNo: 1, courseNo: "FNR-321", courseType: "None", titleOfCourse: "FOREST LAWS LEGISLATION AND POLICIES", credit: "2(2+0)" },
    { sNo: 2, courseNo: "FNR-322", courseType: "None", titleOfCourse: "BIOMETRICS", credit: "3(1+2)" },
    { sNo: 3, courseNo: "FNR-323", courseType: "None", titleOfCourse: "BIO-GENETICS & URBAN FORESTRY", credit: "3(1+1)" },
    { sNo: 4, courseNo: "FNR-324", courseType: "None", titleOfCourse: "RESTORATION ECOLOGY", credit: "3(1+1)" },
    { sNo: 5, courseNo: "FWL-321", courseType: "None", titleOfCourse: "WILDLIFE BIOLOGY", credit: "3(1+1)" },
    { sNo: 6, courseNo: "FFL-321", courseType: "None", titleOfCourse: "NON- TIMBER FOREST PRODUCTS", credit: "3(2+1)" },
    { sNo: 7, courseNo: "FFL-322", courseType: "None", titleOfCourse: "CERTIFICATION OF FOREST PRODUCTS", credit: "3(2+1)" },
    { sNo: 8, courseNo: "FSA-321", courseType: "None", titleOfCourse: "PLANTATION FORESTRY", credit: "3(2+1)" }
  ];


    printData() {
    const content = document.getElementById('print-section')?.innerHTML;
    if (content) {
      this.print.printHTML(content);
    } else {
      console.error('Printable section not found');
    }
  }



}
