import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { pricingPolicyApi } from '@constants/api.constant';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { firstValueFrom, tap } from 'rxjs';
import { Toast } from 'src/app/shared/enums/toast.enum';

@Component({
  selector: 'app-add-new-pricing-policy',
  templateUrl: './add-new-pricing-policy.component.html',
})
export class AddNewPricingPolicyComponent implements OnInit {
  @Input() pricingPolicy: any;
  pricingPolicyForm: FormGroup;

  helpers = inject(HelpersService);
  activeDrawer = inject(NgbActiveOffcanvas);
  fb = inject(FormBuilder);
  dataService = inject(DataService);
  toast = inject(ToastService);
  spinner = inject(NgxSpinnerService);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    let nameAr;
    let nameEn;
    let notes;
    if (this.pricingPolicy) {
      nameAr = this.pricingPolicy.NameAr;
      nameEn = this.pricingPolicy.NameEn;
      notes = this.pricingPolicy.Notes;
    }
    this.pricingPolicyForm = this.fb.group({
      nameAr: [nameAr],
      nameEn: [nameEn],
      notes: [notes],
    });
  }

  submit(): void {
    this.spinner.show();
    if (this.pricingPolicy) {
      firstValueFrom(
        this.dataService
          .put(
            `${pricingPolicyApi}/UpdatePricingPolicy`,
            this.pricingPolicyForm.value,
            { params: { id: this.pricingPolicy.Id } }
          )
          .pipe(
            tap((_) => {
              this.spinner.hide();
              this.activeDrawer.close(true);
              this.toast.show(Toast.updated, {
                classname: Toast.success,
              });
            })
          )
      );
      return;
    }
    firstValueFrom(
      this.dataService
        .post(
          `${pricingPolicyApi}/CreatePricingPolicy`,
          this.pricingPolicyForm.value
        )
        .pipe(
          tap((_) => {
            this.spinner.hide();
            this.activeDrawer.close(true);
            this.toast.show(Toast.added, {
              classname: Toast.success,
            });
          })
        )
    );
  }
}
