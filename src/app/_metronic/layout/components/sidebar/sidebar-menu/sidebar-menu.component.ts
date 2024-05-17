import { Component, OnInit } from '@angular/core';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit {
  navItems: any = [
    {
      name: 'dashboard',
      route: '/dashboard',
      icon: 'socicon-coderwall',
    },
    {
      name: 'sales',
      icon: 'fa-chart-bar',
      children: [
        {
          title: 'salesInvoice',
          route: '/sales-invoice',
          permission: 'SaleInvoice-GetAll',
        },
        {
          title: 'salesReturn',
          route: '/sales-return',
          permission: 'SaleInvoice-GetAll',
        },
        {
          title: 'pricingPolicy',
          route: '/pricing-policy',
          permission: 'SaleInvoice-GetAll',
        },
        {
          title: 'pricingPolicyLists',
          route: '/pricing-policy-lists',
          permission: 'SaleInvoice-GetAll',
        },
        {
          title: 'salesSettings',
          route: '/sales-settings',
          permission: 'SaleInvoice-GetAll',
        },
      ],
    },
  ];

  constructor(
    private layoutInit: LayoutInitService,
    public layout: LayoutService,
    public helpers: HelpersService
  ) {}

  ngOnInit(): void {}

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }
}
