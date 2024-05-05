import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ACCESS_TOKEN } from '@constants/general.constant';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HelpersService } from 'src/app/shared/services/helpers.service';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  private unsubscribe: Subscription[] = [];
  userAccount: any;

  constructor(
    private router: Router,
    public translate: TranslateService,
    public helpers: HelpersService
  ) {}

  ngOnInit(): void {}

  logout(): void {
    this.helpers.removeItemFromLocalStorage(ACCESS_TOKEN);
    this.router.navigateByUrl('/auth');
  }

  changeLanguage(value: string): void {
    this.translate.use(value);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
