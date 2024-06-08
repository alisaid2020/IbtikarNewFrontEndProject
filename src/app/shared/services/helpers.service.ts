import { DOCUMENT } from '@angular/common';
import {
  ElementRef,
  Inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  signal,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  showOverlay = signal(false);
  salesSettings: any = signal(null);
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
    private permissionsService: NgxPermissionsService,
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

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

  getTranslatedName(item: any): string {
    const currLang = this.translate.currentLang;
    if (item?.NameEn) {
      return currLang === 'ar' ? item?.NameAr : item?.NameEn;
    }
    return item?.NameAr ? item?.NameAr : null;
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
    a.target = '_blank';
    a.style.display = 'none';
    this.document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    this.document.body.removeChild(a);
  }

  // remove empty lines from form array
  removeEmptyLines(myFormArray: FormArray): any {
    return myFormArray.controls
      .filter((formGroup: any) =>
        Object.values(formGroup.controls).some((control: any) => control.value)
      )
      .map((formGroup) => formGroup.value);
  }

  // focus on slect field in next row
  focusOnNextRow(i: any, selector: any, elementRef: ElementRef): void {
    const ngSelectElements = this.renderer
      .selectRootElement(elementRef.nativeElement, true)
      .querySelectorAll(`#${selector}`);
    const lastNgSelect = ngSelectElements[i];
    if (lastNgSelect) {
      const inputElement = lastNgSelect.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    }
  }

  hasPermission(pageName: string): boolean {
    const permissions: any = this.permissionsService.getPermissions();
    return Object.keys(permissions).some((key: any) =>
      key.startsWith(pageName)
    );
  }
}
