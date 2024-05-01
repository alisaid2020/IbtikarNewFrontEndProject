import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  navItems: any = [
    {
      name: 'sideBarMenu.departments',
      route: '/departments',
      icon: 'fa-users-viewfinder',
    },
    {
      name: 'Dashboards',
      route: '/',
      icon: 'fa-bar-chart',
      children: [
        {
          title: 'general',
          route: '/',
        },
      ],
    },
  ];


  constructor() { }

  ngOnInit(): void {
  }

}
