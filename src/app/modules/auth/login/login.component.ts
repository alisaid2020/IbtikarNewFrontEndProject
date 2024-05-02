import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, tap } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  items = [{ value: 1, name: 'arabic' }];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  initForm(): void {
    let selectControl;
    this.loginForm = this.fb.group({
      Email: [environment.email, [Validators.required]],
      Password: [environment.password, [Validators.required]],
      selectControl: [selectControl, [Validators.required]],
    });
  }

  submit(): void {
    this.router.navigateByUrl('/');
  }
}
