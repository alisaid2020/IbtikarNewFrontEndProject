import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, tap } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '@services/data.service';
import { branchesApi, loginApi } from '@constants/api.constant';
import { HelpersService } from '@services/helpers.service';
import {
  ACCESS_TOKEN,
  ADMIN_PROFILE,
  REMEMBER_ME,
} from '@constants/general.constant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  branches: any;
  userProfile: any;

  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  spinner = inject(NgxSpinnerService);
  dataService = inject(DataService);
  helpers = inject(HelpersService);

  ngOnInit(): void {
    this.getBranches();
    this.initForm();
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  getBranches() {
    firstValueFrom(
      this.dataService.get(`${branchesApi}/GetAllForDropDown`).pipe(
        tap((res) => {
          this.branches = res;
        })
      )
    );
  }

  initForm(): void {
    let userName;
    let password;
    let branchId;
    let companyId = 1;
    let rememberMe = false;
    if (this.helpers.checkItemFromLocalStorage(REMEMBER_ME)) {
      this.userProfile = this.helpers.getItemFromLocalStorage(ADMIN_PROFILE);
      userName = this.userProfile.Obj.UserName;
      rememberMe = this.helpers.getItemFromLocalStorage(REMEMBER_ME);
    }
    this.loginForm = this.fb.group({
      userName: [userName, [Validators.required]],
      password: [password, [Validators.required]],
      branchId: [branchId, [Validators.required]],
      companyId: [companyId],
      rememberMe: [rememberMe],
    });
  }

  submit(): void {
    this.spinner.show();
    firstValueFrom(
      this.dataService.post(loginApi, this.loginForm.value).pipe(
        tap((res) => {
          this.helpers.setItemToLocalStorage(ACCESS_TOKEN, res.Obj.AccessToken);
          this.helpers.setItemToLocalStorage(
            REMEMBER_ME,
            this.loginForm.value.rememberMe
          );
          this.helpers.setItemToLocalStorage(ADMIN_PROFILE, res);
          this.spinner.hide();
          this.router.navigateByUrl('/');
        })
      )
    );
  }
}
