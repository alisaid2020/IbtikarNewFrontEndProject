import { Component, OnInit } from '@angular/core';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit {
  navItems: any = [
    // for menu of links
    // {
    //   name: 'general',
    //   route: '/general',
    //   icon: 'fa-bar-chart',
    //   children: [
    //     {
    //       title: 'general',
    //       route: '/general',
    //     },
    //   ],
    // },
    // for link
    {
      name: 'general',
      route: '/general',
      icon: 'fa-users-viewfinder',
    },
  ];

  constructor(
    private layoutInit: LayoutInitService,
    public layout: LayoutService
  ) {}

  ngOnInit(): void {}

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }
}
