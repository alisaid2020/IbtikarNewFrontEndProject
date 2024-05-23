import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from './toast-service';
import { Toast } from '../enums/toast.enum';
import { ACCESS_TOKEN } from '../constants/general.constant';
import { HelpersService } from './helpers.service';
import { LoadingService } from './loading.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private helpers: HelpersService,
    private toast: ToastService,
    private loadingService: LoadingService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((res: any) => {
        if (!res?.body?.IsSuccess) {
          this.spinner.hide();
          this.loadingService.isLoading$.next(false);
          this.toast.show(res?.body?.Message, {
            classname: Toast.error,
            delay: 5000,
          });
          return throwError(() => new Error(res));
        }
      }),
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
