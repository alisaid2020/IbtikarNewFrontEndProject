import { Component, OnInit } from '@angular/core';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { HelpersService } from '@services/helpers.service';
import { generalAccountsLink } from '@constants/api.constant';

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
      name: 'generalAccounts',
      href: generalAccountsLink,
      icon: 'fa-calculator',
    },
    {
      name: 'sales',
      icon: 'fa-receipt',
      children: [
        {
          title: 'salesInvoice',
          route: '/sales-invoice',
          // permission: 'SaleInvoice',
        },
        {
          title: 'salesReturn',
          route: '/sales-return',
          // permission: 'SaleInvoice_Return',
        },
        {
          title: 'pricingPolicy',
          route: '/pricing-policy',
          // permission: 'pricelistDefintion',
        },
        {
          title: 'pricingPolicyLists',
          route: '/pricing-policy-lists',
          // permission: 'pricelist',
        },
        {
          title: 'salesSettings',
          route: '/sales-settings',
          // permission: 'SaleInvoice',
        },
      ],
    },
    {
      name: 'accounts',
      icon: 'fa-tag',
      children: [
        {
          title: 'receiptVouchers',
          route: 'receipt-vouchers',
          // permission: 'SaleInvoice',
        },
        {
          title: 'paymentVouchers',
          route: 'payment-vouchers',
          // permission: 'SaleInvoice',
        },
        {
          title: 'manualRestrictions',
          route: 'manual-restrictions',
          // permission: 'SaleInvoice',
        },
      ],
    },
    {
      name: 'warehouses',
      icon: 'fa-warehouse',
      children: [
        {
          title: 'transfersUnderProcedure',
          route: 'transfers-under-procedure',
          // permission: 'SaleInvoice',
        },
        {
          title: 'inventoryTransfers',
          route: 'inventory-transfers',
          // permission: 'SaleInvoice',
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
