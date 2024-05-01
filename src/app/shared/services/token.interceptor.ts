import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { HelpersService } from './helpers.service';
import { ACCESS_TOKEN } from '../constants/general.constant';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  constructor(private helpers: HelpersService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.helpers.getItemFromLocalStorage(ACCESS_TOKEN);
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    request = request.clone({
      setHeaders: headers,
    });
    return next.handle(request);
  }
}
