import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ACCESS_TOKEN, USER_PROFILE } from '@constants/general.constant';
import { TranslateService } from '@ngx-translate/core';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  userProfile: any;

  constructor(
    private router: Router,
    public translate: TranslateService,
    public helpers: HelpersService
  ) {}

  ngOnInit(): void {
    if (this.helpers.checkItemFromLocalStorage(USER_PROFILE)) {
      this.userProfile = this.helpers.getItemFromLocalStorage(USER_PROFILE);
    }
  }

  logout(): void {
    this.helpers.removeItemFromLocalStorage(ACCESS_TOKEN);
    this.router.navigateByUrl('/auth');
  }

  changeLanguage(value: string): void {
    this.translate.use(value);
  }
}
