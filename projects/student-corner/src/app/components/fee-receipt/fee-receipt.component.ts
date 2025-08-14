import { Component } from '@angular/core';

@Component({
  selector: 'app-fee-receipt',
  standalone: false,
  templateUrl: './fee-receipt.component.html',
  styleUrl: './fee-receipt.component.scss'
})
export class FeeReceiptComponent {
feeRecords = [
    {
      id: 1,
      category: 'Registration Fee',
      icon: '📝',
      yearSemester: 'I Year - I Semester',
      receiptNo: '1399',
      paymentDate: '08-08-2018',
      amount: 620,
      paymentMode: 'Online',
      status: 'paid'
    },
    {
      id: 2,
      category: 'Tuition Fee',
      icon: '🎓',
      yearSemester: 'I Year - II Semester',
      receiptNo: '1487',
      paymentDate: '15-01-2019',
      amount: 8500,
      paymentMode: 'Bank Transfer',
      status: 'paid'
    },
    {
      id: 3,
      category: 'Exam Fee',
      icon: '📋',
      yearSemester: 'II Year - I Semester',
      receiptNo: 'Pending',
      paymentDate: '-',
      amount: 1200,
      paymentMode: '-',
      status: 'pending'
    },
    {
      id: 4,
      category: 'Hostel Fee',
      icon: '🏠',
      yearSemester: 'I Year - II Semester',
      receiptNo: '1456',
      paymentDate: '22-12-2018',
      amount: 15000,
      paymentMode: 'Cash',
      status: 'paid'
    },
    {
      id: 5,
      category: 'Library Fee',
      icon: '📚',
      yearSemester: 'II Year - I Semester',
      receiptNo: 'Pending',
      paymentDate: '-',
      amount: 500,
      paymentMode: '-',
      status: 'pending'
    },
    {
      id: 6,
      category: 'Laboratory Fee',
      icon: '🔬',
      yearSemester: 'II Year - II Semester',
      receiptNo: '1598',
      paymentDate: '10-03-2019',
      amount: 2500,
      paymentMode: 'Online',
      status: 'paid'
    }
  ];
  feeCategories = [
  { label: 'Registration Fee', value: 'registration' },
  { label: 'Tuition Fee', value: 'tuition' },
  { label: 'Exam Fee', value: 'exam' },
  { label: 'Hostel Fee', value: 'hostel' },
  { label: 'Library Fee', value: 'library' },
  { label: 'Laboratory Fee', value: 'lab' }
];

selectedCategory: string | null = null;
}
