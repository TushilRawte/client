import { Component, Input } from '@angular/core';
import { HttpService } from 'shared';
import { Router } from '@angular/router';


export interface Student {
  name: string;
  program: string;
  enrollmentNumber: string;
  semester: string;
  cgpa: number;
  email: string;
  phone: string;
  department: string;
  profileImage?: string;
}

export interface MenuItem {
  icon: string;
  label: string;
  isActive: boolean;
  hasSubmenu?: boolean;
  isExpanded?: boolean;
  submenus?: SubMenuItem[];
  route?: string;
}

export interface SubMenuItem {
  label: string;
  route: string;
  isActive?: boolean;
}




// ^ new code end


@Component({
  selector: 'app-new-layout',
  standalone: false,
  templateUrl: './new-layout.component.html',
  styleUrl: './new-layout.component.scss'
})
export class NewLayoutComponent {

  studentData: any;
  isSidebarOpen: boolean = false;
  igkvUrl:string = 'https://igkv.ac.in/'



  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  constructor(private HTTP: HttpService,private router: Router) { }

  ngOnInit(): void {
    this.getStudentDetails();
  }

  searchQuery: string = '';

  @Input() student: Student = {
    name: 'John Doe',
    program: 'Computer Science',
    enrollmentNumber: 'CS2023001',
    semester: '6th Semester',
    cgpa: 8.5,
    email: 'john.doe@university.edu',
    phone: '+1 234 567 8900',
    department: 'Computer Science & Engineering'
  };



  // ^ new code start

  menuItems: MenuItem[] = [
    {
      icon: 'fas fa-th-large',
      label: 'Dashboard',
      isActive: true,
      route: 'dashboard'
    },
    {
      icon: 'fas fa-chalkboard-teacher',
      label: 'My Corner',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Profile', route: 'profile', isActive: false },
      ]
    },
    {
      icon: 'fas fa-book',
      label: 'E-Krishi Pathshala',
      isActive: false,
      hasSubmenu: false,
      isExpanded: false,
      submenus: [
        { label: 'Exam Result', route: 'result', isActive: false },
      ]
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Registration',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Registration', route: '/course-registration', isActive: false },
        { label: 'Registration Cards', route: 'registration-card', isActive: false },
      ]
    },
    {
      icon: 'fas fa-chart-bar',
      label: 'Fees',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Fee Receipts', route: 'fee-receipt', isActive: false },
        { label: 'Previous Fees', route: '/results/assignments', isActive: false },
        { label: 'Payment Status', route: 'payment-status', isActive: false },
      ]
    },
    {
      icon: 'fas fa-graduation-cap',
      label: 'Exams',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Admit Card', route: 'admit-card', isActive: false },
        { label: 'Previous Question Papers', route: '/exams/past', isActive: false },
      ]
    },
    {
      icon: 'fas fa-graduation-cap',
      label: 'Result',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Result', route: '/exams/upcoming', isActive: false },
      ]
    },
    {
      icon: 'fas fa-calendar-alt',
      label: 'Timetable',
      isActive: false,
      route: '/timetable'
    },
    {
      icon: 'fas fa-graduation-cap',
      label: 'Certificates',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Apply Transfer Certificate', route: '/exams/upcoming', isActive: false },
        { label: 'Apply Migration Certificate', route: '/exams/upcoming', isActive: false },
        { label: 'Get SRC', route: '/exams/upcoming', isActive: false },
      ]
    },
    {
      icon: 'fas fa-cog',
      label: 'Settings',
      isActive: false,
      hasSubmenu: true,
      isExpanded: false,
      submenus: [
        { label: 'Profile Settings', route: '/settings/profile', isActive: false },
        { label: 'Notifications', route: '/settings/notifications', isActive: false },
        { label: 'Privacy', route: '/settings/privacy', isActive: false },
        { label: 'Account', route: '/settings/account', isActive: false }
      ]
    },
    {
      icon: 'fas fa-sign-out-alt',
      label: 'Logout',
      isActive: false,
      route: '/logout'
    }
  ];





  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
  // Methods
  // onMenuClick(item: any): void {
  //   this.menuItems.forEach(menu => menu.isActive = false);
  //   item.isActive = true;
  // }


  // ^ new code s
  onMenuClick(item: MenuItem): void {
    if (item.hasSubmenu) {
      // Toggle submenu expansion
      item.isExpanded = !item.isExpanded;

      // Close other expanded menus (optional - for accordion behavior)
      this.menuItems.forEach(menu => {
        if (menu !== item && menu.hasSubmenu) {
          menu.isExpanded = false;
        }
      });
    } else {
      // Handle regular menu items
      this.menuItems.forEach(menu => {
        menu.isActive = false;
        if (menu.submenus) {
          menu.submenus.forEach(sub => sub.isActive = false);
        }
      });
      item.isActive = true;

      // Navigate to route (implement your routing logic here)
      console.log('Navigating to:', item.route);
         if (item.route) {
      this.router.navigateByUrl(item.route);
    }   
    }
  }

  // New method for submenu click
  onSubmenuClick(parentItem: MenuItem, submenuItem: SubMenuItem): void {
    // Reset all active states
    this.menuItems.forEach(menu => {
      menu.isActive = false;
      if (menu.submenus) {
        menu.submenus.forEach(sub => sub.isActive = false);
      }
    });

    // Set parent as active and submenu as active
    parentItem.isActive = true;
    submenuItem.isActive = true;


    // Navigate to submenu route
    console.log('Navigating to submenu:', submenuItem.route);
    this.router.navigateByUrl(submenuItem.route);

    // Close sidebar on mobile after selection
    this.closeSidebar();
  }


  getStudentDetails() {
    // ^ this data will get from login session
    const academic_session_id = 24;
    const course_year_id = 2;
    const semester_id = 1;
    const college_id = 7;
    const degree_programme_id = 10;
    const ue_id = 20230270;
    const params = {
      academic_session_id: academic_session_id,
      course_year_id: course_year_id,
      semester_id: semester_id,
      college_id: college_id,
      degree_programme_id: degree_programme_id,
      ue_id: ue_id
    }
    this.HTTP.getParam('/course/get/getStudentList/', params, 'academic').subscribe((result: any) => {
      console.warn(result.body.data[0])
      this.studentData = result.body.data[0];
    })
  }



}






