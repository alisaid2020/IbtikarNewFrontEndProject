import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { ACCESS_TOKEN } from '@constants/general.constant';
import { HelpersService } from '@services/helpers.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private router: Router, private helpers: HelpersService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = this.helpers.getItemFromLocalStorage(ACCESS_TOKEN);
    if (!token) {
      this.router.navigate(['/auth']);
      return false;
    } else {
      return true;
    }
  }
}
