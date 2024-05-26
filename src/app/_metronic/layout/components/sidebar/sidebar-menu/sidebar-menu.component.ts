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
      icon: 'fa-chart-line',
    },
    {
      name: 'sales',
      icon: 'fa-receipt',
      children: [
        {
          title: 'salesInvoice',
          route: '/sales-invoice',
          permission: 'SaleInvoice',
        },
        {
          title: 'salesReturn',
          route: '/sales-return',
          permission: 'SaleInvoice_Return',
        },
        {
          title: 'pricingPolicy',
          route: '/pricing-policy',
          permission: 'pricelistDefintion',
        },
        {
          title: 'pricingPolicyLists',
          route: '/pricing-policy-lists',
          permission: 'pricelist',
        },
        {
          title: 'salesSettings',
          route: '/sales-settings',
          permission: 'SaleInvoice',
        },
        {
          title: 'receiptVouchers',
          route: 'receipt-vouchers',
          permission: 'SaleInvoice',
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
