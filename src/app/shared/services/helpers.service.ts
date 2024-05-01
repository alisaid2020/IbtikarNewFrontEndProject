import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  constructor() {}

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
}
