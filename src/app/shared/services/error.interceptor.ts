import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from './toast-service';
import { Toast } from '../enums/toast.enum';
import { ACCESS_TOKEN } from '../constants/general.constant';
import { HelpersService } from './helpers.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private helpers: HelpersService,
    private toast: ToastService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        this.spinner.hide();
        const error = err.error.Message;
        if (err.status === 401) {
          const queryParams = {
            returnUrl: this.router.url,
          };
          this.router.navigate(['/auth/login'], {
            queryParams,
          });
          this.helpers.removeItemFromLocalStorage(ACCESS_TOKEN);
          this.toast.show(error, {
            classname: Toast.error,
          });
        } else {
          this.toast.show(error, {
            classname: Toast.error,
            delay: 5000,
          });
        }
        return throwError(() => new Error(err));
      })
    );
  }
}
