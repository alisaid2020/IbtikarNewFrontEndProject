import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  post(apiUrl: string, body: any, options?: any): Observable<any> {
    return this.http.post(apiUrl, body, options);
  }
  patch(apiUrl: string, body: any, options?: any): Observable<any> {
    return this.http.patch(apiUrl, body, options);
  }
  get(apiUrl: string, options?: any): Observable<any> {
    return this.http.get(apiUrl, options);
  }
  delete(apiUrl: string, options?: any): Observable<any> {
    return this.http.delete(apiUrl, options);
  }
  put(apiUrl: string, body: any, options?: any): Observable<any> {
    return this.http.put(apiUrl, body, options);
  }
}
