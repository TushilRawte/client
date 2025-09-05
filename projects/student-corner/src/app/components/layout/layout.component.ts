import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';


@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
[x: string]: any;
 isHandset$!: Observable<boolean>;
  constructor(private breakpointObserver: BreakpointObserver) {}
  isDashboardExpanded = false;

  ngOnInit(): void {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  menuItems = [
    {
      label: 'My Corner',
      icon: 'receipt_long',
      route: 'claims-bills',
      expanded: false,
      children: [
        { label: 'Profile', route: 'profile' },
        { label: 'Apply Transfer Certificate', route: 'submit-claim' },
        { label: 'Apply Migration Certificate', route: 'submit-claim' }
      ]
    },
    {
      label: 'E-Krishi Pathshala',
      icon: 'assessment',
      route: 'finance-reports',
      expanded: false,
      children: [
        { label: 'Exam Result', route: 'result' },
      ]
    },
    {
      label: 'Reports',
      icon: 'dashboard',
      route: 'dashboard',
      expanded: false,
      children: [
        { label: 'Registration Card', route: 'registration-card' },
        { label: 'SRC', route: 'my-corner-dashboard' },
   
      ]
    },
    {
      label: 'study material',
      icon: 'person',
      route: 'my-profile',
      expanded: false,
      children: [
        { label: 'study material', route: 'personal-info' }
      ]
    },
    {
      label: 'Payment & Fees',
      icon: 'security',
      route: 'my-access',
      expanded: false,
      children: [
        { label: 'Fee Receipt', route: 'fee-receipt' },
        { label: 'Payment Status', route: 'payment-status' },
        { label: 'Old Fee Payment', route: 'access-log' }
      ]
    },
       {
      label: 'Admit Card',
      icon: 'security',
      route: 'my-access',
      expanded: false,
      children: [
        { label: 'Old Admit Card', route: 'permissions' },
        { label: 'Admit Card', route: 'admit-card' }
      ]
    }
  ];
   toggleMenu(index: number): void {
    this.menuItems[index].expanded = !this.menuItems[index].expanded;
  }


}





