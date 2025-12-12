import { Component } from '@angular/core';
import { HttpService } from 'shared';

export interface StatCard {
  title: string;
  value: string;
  icon: string;
  gradient: string;
}

export interface ExamData {
  subject: string;
  date: string;
  time: string;
  rank: number;
  studentName: string;
  score: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardData {
  rank: number;
  studentName: string;
  score: string;
  isCurrentUser?: boolean;
}

export interface Announcement {
  date: string;
  title: string;
  hasAlert?: boolean;
}


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
studentData:any;
igkvUrl:string = 'https://igkv.ac.in/'

 constructor(private HTTP: HttpService) { }

   ngOnInit(): void {
    this.getStudentDetails();
  }

  currentMonth = 'April 2023';
  currentDay = 9;

  statCards: StatCard[] = [
    {
      title: 'Reg. Courses',
      value: '20/50',
      icon: '📊',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    {
      title: 'Attendance',
      value: '70%',
      icon: '📚',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      title: 'Marks secured',
      value: '600/800',
      icon: '📝',
      gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    },
    {
      title: 'Leadership',
      value: '3rd',
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    }
  ];

  upcomingExams: ExamData[] = [
    {
      subject: 'English I',
      date: '18th May, 2023',
      time: '08:00 - 09:00 am',
      rank: 1,
      studentName: 'Emily Rose',
      score: '500/600'
    },
    {
      subject: 'Physics',
      date: '18th May, 2023',
      time: '09:00 - 10:00 am',
      rank: 2,
      studentName: 'Daisy Cloe',
      score: '580/600'
    },
    {
      subject: 'Chemistry',
      date: '18th May, 2023',
      time: '08:00 - 02:00 pm',
      rank: 3,
      studentName: 'You',
      score: '575/600',
      isCurrentUser: true
    },
    {
      subject: 'Math',
      date: '18th May, 2023',
      time: '04:00 - 06:00 pm',
      rank: 4,
      studentName: 'Mick Jhonathon',
      score: '490/600'
    },
    {
      subject: 'Hindi',
      date: '18th May, 2023',
      time: '12:00 - 01:00 pm',
      rank: 5,
      studentName: 'Jack Memba',
      score: '460/600'
    }
  ];

leaderboardData: LeaderboardData[] = [
    { rank: 1, studentName: 'Emily Rose', score: '500/600' },
    { rank: 2, studentName: 'Daisy Cloe', score: '01/09/2023' },
    { rank: 3, studentName: 'You', score: '575/600', isCurrentUser: true },
    { rank: 4, studentName: 'Mick Jhonathon', score: '490/600' },
    { rank: 5, studentName: 'Jack Memba', score: '460/600' }
  ];

  announcements: Announcement[] = [
    {
      date: '01/05/2023',
      title: 'Semester exams will start from 18th May...',
      hasAlert: false
    },
    {
      date: '01/05/2023',
      title: 'Semester exams will start from 18th May...',
      hasAlert: true
    }
  ];


  // Calendar data
    calendarDays = [
      ['27', '28', '29', '30', '1', '2', '3'],
      ['4', '5', '6', '7', '8', '9', '10'],
      ['11', '12', '13', '14', '15', '16', '17'],
      ['18', '19', '20', '21', '22', '23', '24'],
      ['25', '26', '27', '28', '29', '30', '1']
    ];
  
    ongoingClass = {
      title: "PH's Law of designing Theory",
      subject: 'Physics',
      duration: '3:00:00',
      status: 'On Share',
      teacherImage: 'https://via.placeholder.com/80x60/007bff/ffffff?text=Teacher'
    };


    
  joinClass(): void {
    console.log('Joining class...');
  }

  leaveClass(): void {
    console.log('Leaving class...');
  }

  getRankBadgeClass(rank: number): string {
    return rank <= 3 ? 'bg-warning' : 'bg-secondary';
  }

  isToday(day: string): boolean {
    return parseInt(day) === this.currentDay && !isNaN(parseInt(day));
  }

  previousMonth(): void {
    console.log('Previous month');
  }

  nextMonth(): void {
    console.log('Next month');
  }

    getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = 25;
    const semester_id = 1;
    const college_id = 5;

    const course_year_id = 2;
    const degree_programme_id = 1;// all pass
    const ue_id = 20240301; // all pass

    // const ue_id = 20230129; // fail in theory
    // const degree_programme_id = 16; // fail in theory
    // const course_year_id = 2;


    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id
    }
    sessionStorage.setItem('studentData', JSON.stringify(params));

    this.HTTP.getParam('/course/get/getStudentList/', params, 'academic').subscribe((result: any) => {
      console.warn(result.body.data[0])
      this.studentData = result.body.data[0];
    })
  }




  //student data course repeater

/*     const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id
    } */


    //regular student
    
   /*    const academic_session_id = 24;
    const course_year_id = 3;
    const semester_id = 1;
    const college_id = 5;
    const degree_programme_id = 8;
    const ue_id = 20220056; */

//Academic Probation (OGPA improvement)

  /*    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id
    } */

}
