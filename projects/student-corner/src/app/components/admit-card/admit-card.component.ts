import { Component } from '@angular/core';

@Component({
  selector: 'app-admit-card',
  standalone: false,
  templateUrl: './admit-card.component.html',
  styleUrl: './admit-card.component.scss'
})
export class AdmitCardComponent {
  registrationData = [
  {
    academicYear: '2017-18',
    year: 'IV Year',
    semester: 'II Semester',
    status: 'Regular',
    examType: 'Regular',
    registrationStatus: 'Registered',
    downloadLink: '#'
  },
  {
    academicYear: '2017-18',
    year: 'IV Year',
    semester: 'I Semester',
    status: 'Regular',
    examType: 'Regular',
    registrationStatus: 'Registered',
    downloadLink: '#'
  },
  {
    academicYear: '2016-17',
    year: 'III Year',
    semester: 'II Semester',
    status: 'Academic Probation',
    examType: 'Regular',
    registrationStatus: 'Registered',
    downloadLink: '#'
  },
  {
    academicYear: '2016-17',
    year: 'III Year',
    semester: 'I Semester',
    status: 'Academic Probation',
    examType: 'Regular',
    registrationStatus: 'Registered',
    downloadLink: '#'
  }
];
}
