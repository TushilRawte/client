import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-status',
  standalone: false,
  templateUrl: './payment-status.component.html',
  styleUrl: './payment-status.component.scss'
})
export class PaymentStatusComponent {
  feeDetails = [
    {
      session: '2014-15',
      yearSemester: 'I Year / I Semester',
      status: ['Regular', 'New Entrant'],
      paidFees: [
        { label: 'Hostel Fee Wise', type: 'Paid', receipt: false },
        { label: 'Registration Fee', type: 'Paid', receipt: true },
      ],
      applicableFees: [
        { label: 'Registration Fee', type: 'Paid', mode: 'CASH', receipt: false },
      ],
    },
    {
      session: '2014-15',
      yearSemester: 'I Year / II Semester',
      status: ['Regular', 'Continuing Student'],
      paidFees: [
        { label: 'Semester Registration Fee', type: 'Paid', receipt: true },
        { label: 'Revaluation Fee', type: 'Paid', receipt: true },
      ],
      applicableFees: [
        { label: 'Semester Registration Fee', type: 'Paid', mode: 'OTHERCARD', receipt: true },
      ],
    },
  ]
}
