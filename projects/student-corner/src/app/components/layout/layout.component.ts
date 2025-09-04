import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';


// ^ new code start

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


// ^ new code end





@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
[x: string]: any;
//  isHandset$!: Observable<boolean>;
  // constructor(private breakpointObserver: BreakpointObserver) {}
  // isDashboardExpanded = false;

  // ngOnInit(): void {
  //   this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
  //     map(result => result.matches),
  //     shareReplay()
  //   );
  // }

  // menuItems = [
  //   {
  //     label: 'My Corner',
  //     icon: 'receipt_long',
  //     route: 'claims-bills',
  //     expanded: false,
  //     children: [
  //       { label: 'Profile', route: 'profile' },
  //       { label: 'Apply Transfer Certificate', route: 'submit-claim' },
  //       { label: 'Apply Migration Certificate', route: 'submit-claim' }
  //     ]
  //   },
  //   {
  //     label: 'E-Krishi Pathshala',
  //     icon: 'assessment',
  //     route: 'finance-reports',
  //     expanded: false,
  //     children: [
  //       { label: 'Exam Result', route: 'result' },
  //     ]
  //   },
  //   {
  //     label: 'Reports',
  //     icon: 'dashboard',
  //     route: 'dashboard',
  //     expanded: false,
  //     children: [
  //       { label: 'Registration Card', route: 'registration-card' },
  //       { label: 'SRC', route: 'my-corner-dashboard' },
   
  //     ]
  //   },
  //   {
  //     label: 'study material',
  //     icon: 'person',
  //     route: 'my-profile',
  //     expanded: false,
  //     children: [
  //       { label: 'study material', route: 'personal-info' }
  //     ]
  //   },
  //   {
  //     label: 'Payment & Fees',
  //     icon: 'security',
  //     route: 'my-access',
  //     expanded: false,
  //     children: [
  //       { label: 'Fee Receipt', route: 'fee-receipt' },
  //       { label: 'Payment Status', route: 'payment-status' },
  //       { label: 'Old Fee Payment', route: 'access-log' }
  //     ]
  //   },
  //      {
  //     label: 'Admit Card',
  //     icon: 'security',
  //     route: 'my-access',
  //     expanded: false,
  //     children: [
  //       { label: 'Old Admit Card', route: 'permissions' },
  //       { label: 'Admit Card', route: 'admit-card' }
  //     ]
  //   }
  // ];
  //  toggleMenu(index: number): void {
  //   this.menuItems[index].expanded = !this.menuItems[index].expanded;
  // }




  // ^ new code start
   currentUser = {
    name: 'Krishna',
    class: 'Class XII A',
    avatar: 'https://via.placeholder.com/32x32/007bff/ffffff?text=KR'
  };

   searchQuery: string = '';
   isSidebarOpen: boolean = false;
    toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  currentMonth = 'April 2023';
  currentDay = 9;

  statCards: StatCard[] = [
    {
      title: 'Total Projects',
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

  menuItems = [
    { icon: 'fas fa-th-large', label: 'Dashboard', isActive: true },
    { icon: 'fas fa-chalkboard-teacher', label: 'My Corner', isActive: false },
    { icon: 'fas fa-book', label: 'E-Krishi Pathshala', isActive: false },
    { icon: 'fas fa-chart-bar', label: 'Reports', isActive: false },
    { icon: 'fas fa-users', label: 'Team Lists', isActive: false },
    { icon: 'fas fa-layer-group', label: 'Modules', isActive: false },
    { icon: 'fas fa-graduation-cap', label: 'Exams', isActive: false },
    { icon: 'fas fa-calendar-alt', label: 'Timetable', isActive: false },
    { icon: 'fas fa-file-alt', label: 'Request leave', isActive: false },
    { icon: 'fas fa-user-check', label: 'Attendance', isActive: false },
    { icon: 'fas fa-cog', label: 'Settings', isActive: false },
    { icon: 'fas fa-sign-out-alt', label: 'Logout', isActive: false }
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

  constructor() { }

  ngOnInit(): void { }

  // Methods
  onMenuClick(item: any): void {
    this.menuItems.forEach(menu => menu.isActive = false);
    item.isActive = true;
  }

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
}





