import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-receipt-voucher',
  templateUrl: './add-new-receipt-voucher.component.html',
})
export class AddNewReceiptVoucherComponent implements OnInit {
  receiptVoucherForm: FormGroup;
  treasuries: any[];
  banks: any[];
  costCenters: any[];
  currencies: any[];
  typeOfDealing = [
    { value: 1, name: 'bank' },
    { value: 2, name: 'safe' },
  ];
  treasuryTypes = [
    { value: 1, name: 'شجره الحسابات' },
    { value: 2, name: 'العملاء' },
    { value: 3, name: ' البنك' },
    { value: 4, name: 'خزينه اخري ' },
    { value: 5, name: 'الموردين' },
  ];

  fb = inject(FormBuilder);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);
  toast = inject(ToastService);

  ngOnInit(): void {
    this.getTreasuries();
    this.getBanks();
    this.getCostCenters();
    this.getCurrencies();
    this.initForm();
  }

  getBanks(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/ExtraAndPOS_Bank/ManagementInfo`).pipe(
        tap((res) => {
          if (res?.IsSuccess) {
            this.banks = res.Obj.list;
          }
        })
      )
    );
  }

  getTreasuries(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/Treasury/GetAllForDropDown`).pipe(
        tap((res) => {
          this.treasuries = res;
        })
      )
    );
  }

  getCostCenters() {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_CostCenter/ManagementInfo`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.costCenters = res.Obj.list;
            }
          })
        )
    );
  }

  getCurrencies(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPOS_HREmployee/GetCurrencyForDropDown`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.currencies = res.Obj.Currencies;
            }
          })
        )
    );
  }

  initForm() {
    let id;
    let docDate = new Date();
    let typeofpayment;
    let treasuryId;
    let treasuryType;
    let ccenter;
    let currencyId;
    let exchangeRate;
    let notes;
    let deserved;

    this.receiptVoucherForm = this.fb.group({
      id: [id],
      docDate: [docDate],
      typeofpayment: [typeofpayment],
      treasuryId: [treasuryId],
      treasuryType: [treasuryType],
      ccenter: [ccenter],
      currencyId: [currencyId],
      exchangeRate: [exchangeRate],
      notes: [notes],
      deserved: [deserved],
    });
  }
}
