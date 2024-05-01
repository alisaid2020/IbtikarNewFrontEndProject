import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RouterModule, Routes } from '@angular/router';
import {
  NgbDropdownModule,
  NgbProgressbarModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutComponent } from './layout.component';
import { Routing } from '../../pages/routing';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';
import { PageTitleComponent } from './components/header/page-title/page-title.component';
import { HeaderMenuComponent } from './components/header/header-menu/header-menu.component';
import { ThemeModeModule } from '../partials/layout/theme-mode-switcher/theme-mode.module';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarLogoComponent } from './components/sidebar/sidebar-logo/sidebar-logo.component';
import { SidebarMenuComponent } from './components/sidebar/sidebar-menu/sidebar-menu.component';
import { NavbarComponent } from './components/header/navbar/navbar.component';
import { ExtrasModule } from '../partials/layout/extras/extras.module';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: Routing,
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    ContentComponent,
    FooterComponent,
    ScriptsInitComponent,
    PageTitleComponent,
    HeaderMenuComponent,
    SidebarComponent,
    SidebarLogoComponent,
    SidebarMenuComponent,
    NavbarComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InlineSVGModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    NgbTooltipModule,
    TranslateModule,
    ThemeModeModule,
    ExtrasModule
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
