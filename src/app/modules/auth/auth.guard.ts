import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { ACCESS_TOKEN } from 'src/app/shared/constants/general.constant';
import { HelpersService } from 'src/app/shared/services/helpers.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private router: Router, private helpers: HelpersService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return true;
  }
}
