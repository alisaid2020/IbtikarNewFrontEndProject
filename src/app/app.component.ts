import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ACCESS_TOKEN, EBTIKARLANG } from './shared/constants/general.constant';
import { HelpersService } from './shared/services/helpers.service';
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { firstValueFrom, tap } from 'rxjs';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private modeService: ThemeModeService,
    @Inject(DOCUMENT) document: Document,
    private translate: TranslateService,
    public helpers: HelpersService
  ) {
    translate.setDefaultLang('en');
    if (this.helpers.checkItemFromLocalStorage(EBTIKARLANG)) {
      const storedLang = this.helpers.getItemFromLocalStorage(EBTIKARLANG);
      this.translate.use(storedLang);
    } else {
      this.translate.use('en');
    }

    this.translate.onLangChange.subscribe((ev: LangChangeEvent) => {
      this.helpers.setItemToLocalStorage(EBTIKARLANG, ev.lang);
      if (ev.lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
      } else {
        document.body.setAttribute('dir', 'ltr');
      }
    });
  }
  dataService = inject(DataService);

  ngOnInit() {
    this.modeService.init();
    if (this.helpers.checkItemFromLocalStorage(ACCESS_TOKEN)) {
      this.checkRoundToTwoNumbers();
    }
  }

  checkRoundToTwoNumbers(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_SalesSettings/GetSalesSettings`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.helpers.salesSettings.set(res.Obj);
            }
          })
        )
    );
  }
}
