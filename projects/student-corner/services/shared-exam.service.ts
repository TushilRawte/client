import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedExamService {
  constructor() {}
  // ✅ Save data
  setExamData(examData: any) {
    localStorage.setItem('examData', JSON.stringify(examData));
  }

  // ✅ Get data
  getExamData() {
    const data = localStorage.getItem('examData');
    return data ? JSON.parse(data) : null;
  }

  // ✅ Clear data (when payment is done or exam session ends)
  clearExamData() {
    localStorage.removeItem('examData');
  }
}
