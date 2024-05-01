import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EBTIKARLANG } from './shared/constants/general.constant';
import { HelpersService } from './shared/services/helpers.service';
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';

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

  ngOnInit() {
    this.modeService.init();
  }
}
