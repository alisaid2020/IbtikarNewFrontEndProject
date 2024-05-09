import { Injectable } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  constructor(private permissionsService: NgxPermissionsService) {}
  // // Check if user has permission to access a specific page
  // hasPagePermission(pagePermission: string) {
  //   return this.permissionsService.hasPermission(pagePermission);
  // }
  // // Get page name based on language
  // getPageName(pagePermissionKey: string, lang: 'ar' | 'en'): string {
  //   const pagePermission = PAGE_PERMISSIONS[pagePermissionKey];
  //   return pagePermission ? pagePermission[lang] : '';
  // }

  // // Check if user has permission to access a specific action
  // hasActionPermission(actionPermission: string) {
  //   return this.permissionsService.hasPermission(actionPermission);
  // }
}
