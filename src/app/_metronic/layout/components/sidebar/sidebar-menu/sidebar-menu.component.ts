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
    {
      name: 'sales',
      route: '/sales-invoice',
      icon: 'fa-bar-chart',
      children: [
        {
          title: 'salesInvoice',
          route: '/sales-invoice',
        },
        // {
        //   title: 'salesReturn',
        //   route: '/sales-return',
        // },
        {
          title: 'pricingPolicy',
          route: '/pricing-policy',
        },
        // {
        //   title: 'pricingLists',
        //   route: '/pricing-lists',
        // },
        // {
        //   title: 'customerAccountStatement',
        //   route: '/customer-account-statement',
        // },
      ],
    },
    // for link
    // {
    //   name: 'general',
    //   route: '/general',
    //   icon: 'fa-users-viewfinder',
    // },
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
