import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: any[] = [];
  constructor(private translate: TranslateService) {}

  async show(title: string, options: any = {}) {
    if (title) {
      const titleTrans = await firstValueFrom(this.translate.get(title));
      this.toasts.push({ title: titleTrans, ...options });
    }
  }

  remove(toast: any): void {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}
