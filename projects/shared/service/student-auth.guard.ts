import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentAuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    // 1️⃣ Student logged in or not
    if (!this.auth.isStdLoggedIn()) {
      this.router.navigate(['/student-login']);
      return false;
    }

    // // 2️⃣ Ensure user is student
    // if (this.auth.currentUser?.user_type !== 'STUDENT') {
    //   this.router.navigate(['/403']);
    //   return false;
    // }

    // // 3️⃣ Password change enforced
    // if (this.auth.currentUser?.password_flag !== 1) {
    //   this.router.navigate(['/student-login']);
    //   return false;
    // }

    return true;
  }
}
