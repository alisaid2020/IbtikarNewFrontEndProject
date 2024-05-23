import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { Toast } from '@enums/toast.enum';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-sales-settings',
  templateUrl: './sales-settings.component.html',
})
export class SalesSettingsComponent implements OnInit {
  salesSettings: any;
  salesSettingsForm: FormGroup;

  fb = inject(FormBuilder);
  toast = inject(ToastService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);

  ngOnInit(): void {
    this.salesSettings = this.helpers.salesSettings();
    this.initForm();
  }

  initForm(): void {
    let roundToTwoNumbers;

    if (this.salesSettings) {
      roundToTwoNumbers = this.salesSettings?.RoundToTwoNumbers;
    }

    this.salesSettingsForm = this.fb.group({
      roundToTwoNumbers: [roundToTwoNumbers],
    });
  }

  submit(): void {
    this.spinner.show();
    firstValueFrom(
      this.dataService
        .put(
          `${apiUrl}/XtraAndPos_SalesSettings/UpdateSalesSettings`,
          this.salesSettingsForm.value
        )
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.getSalesSettings();
              this.spinner.hide();
              this.toast.show(Toast.updated, { classname: Toast.success });
            }
          })
        )
    );
  }
  getSalesSettings(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_SalesSettings/GetSalesSettings`)
        .pipe(
          tap((res: any) => {
            if (res?.IsSuccess) {
              this.helpers.salesSettings.set(res.Obj);
            }
          })
        )
    );
  }
}
