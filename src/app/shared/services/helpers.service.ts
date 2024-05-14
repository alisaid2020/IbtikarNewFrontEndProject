import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  showOverlay = signal(false);
  salesSettings = signal(null);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
    private permissionsService: NgxPermissionsService
  ) {}

  setItemToLocalStorage(name: string, value: any): void {
    localStorage.setItem(name, JSON.stringify(value));
  }
  getItemFromLocalStorage(name: string): any {
    return JSON.parse(localStorage.getItem(name)!);
  }

  removeItemFromLocalStorage(name: string): any {
    localStorage.removeItem(name);
  }

  checkItemFromLocalStorage(name: string): boolean {
    return !!localStorage.getItem(name);
  }

  fillField(form: FormGroup, field: string, value: any): void {
    form.controls[field].patchValue(value);
  }

  trackBy(item: any): string {
    return item.id;
  }

  // get PDF file from base64
  getPdfFromBase64(base64String: string, fileName: string): void {
    const byteCharacters = window.atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.target = '_blank';
    a.style.display = 'none';
    this.document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    this.document.body.removeChild(a);
  }

  getTranslatedName(item: any): string {
    const currLang = this.translate.currentLang;
    if (item.NameEn) {
      return currLang === 'ar' ? item.NameAr : item.NameEn;
    }
    return item?.NameAr ? item.NameAr : null;
  }

  // remove empty lines from form array
  removeEmptyLines(myFormArray: FormArray): any {
    return myFormArray.controls
      .filter((formGroup: any) =>
        Object.values(formGroup.controls).some((control: any) => control.value)
      )
      .map((formGroup) => formGroup.value);
  }

  hasPermission(myPermission: any) {
    const permissions = this.permissionsService.getPermissions();

    const hasPermission = Object.keys(permissions).some(
      (permission) => permission === myPermission
    );
    return hasPermission;
  }
}
