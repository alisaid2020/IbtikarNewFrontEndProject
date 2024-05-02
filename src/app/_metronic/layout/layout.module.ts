import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RouterModule, Routes } from '@angular/router';
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { LayoutComponent } from './layout.component';
import { ExtrasModule } from '../partials/layout/extras/extras.module';
import { Routing } from '../../pages/routing';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageTitleComponent } from './components/header/page-title/page-title.component';
import { ThemeModeModule } from '../partials/layout/theme-mode-switcher/theme-mode.module';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarLogoComponent } from './components/sidebar/sidebar-logo/sidebar-logo.component';
import { SidebarMenuComponent } from './components/sidebar/sidebar-menu/sidebar-menu.component';
import { NavbarComponent } from './components/header/navbar/navbar.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';
import { HeaderMenuComponent } from './components/header/header-menu/header-menu.component';

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
    PageTitleComponent,
    SidebarComponent,
    SidebarLogoComponent,
    SidebarMenuComponent,
    NavbarComponent,
    HeaderMenuComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    InlineSVGModule,
    NgbProgressbarModule,
    ExtrasModule,
    ThemeModeModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
