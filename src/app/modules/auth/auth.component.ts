import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: '<body[root]>',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  // @HostBinding('class')
  // class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';
  isLogin: boolean;
  subs: Subscription[] = [];

  constructor(public translate: TranslateService, private router: Router) {}

  changeLanguage(value: string): void {
    this.translate.use(value);
  }

  ngOnInit(): void {
    this.detectRoute();
    this.subs.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.detectRoute();
        }
      })
    );
  }

  detectRoute(): void {
    if (this.router.url.includes('login')) {
      this.isLogin = true;
      return;
    }
    this.isLogin = false;
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
