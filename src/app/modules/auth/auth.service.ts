import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/shared/services/data.service';
import { HelpersService } from 'src/app/shared/services/helpers.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  login(loginData: any) {}

  logout(): void {}
}
