import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { E_USER_ROLE } from '@constants/general.constant';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-manual-restriction',
  templateUrl: './add-new-manual-restriction.component.html',
})
export class AddNewManualRestrictionComponent implements OnInit {
  manualRestriction: any;
  manualRestrictionForm: FormGroup;
  costCenters: any[];
  E_USER_ROLE = E_USER_ROLE;
  currencies: any[];
  defaultCurrency: any;

  fb = inject(FormBuilder);
  dataService = inject(DataService);
  helpers = inject(HelpersService);

  ngOnInit(): void {
    this.initForm();
    this.getCostCenters();
    this.getCurrencies();
  }

  initForm(): void {
    let id;
    let docName = 'قيد يدوي';
    let docDate;
    let equivalentPrice;
    let ccenter;
    let currencyId;
    let docNoManual;
    let exchangeRate = 1;
    let notes;
    // not in swagger
    let docNo;
    // what it is value that take
    let docType;

    this.manualRestrictionForm = this.fb.group({
      id: [id],
      docNo: [docNo],
      docName: [docName],
      docType: [docType],
      docDate: [docDate],
      equivalentPrice: [equivalentPrice],
      ccenter: [ccenter],
      currencyId: [currencyId],
      docNoManual: [docNoManual],
      exchangeRate: [exchangeRate],
      notes: [notes],
      glDetail: this.fb.array([this.newLine()]),
    });
  }

  get linesArray(): FormArray {
    return this.manualRestrictionForm.get('glDetail') as FormArray;
  }

  addNewLine(value?: any) {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  newLine(value?: any) {
    let accTreeId;
    let accTreeName;
    let accTreeCode;
    let credit;
    let debit;
    // let clientId;
    // let clientName;
    // let amount = 0;
    // let notes;
    // let bankId;
    // let bankName;
    // let supplierId;
    // let treasuryId;
    // let treasuryName;
    // let costCenterId;
    // let buyInvoiceId;
    // let isVatchecked;
    // let vatVal = 0;
    // let taxNotes;

    return this.fb.group({
      accTreeId: [accTreeId],
      accTreeName: [accTreeName],
      accTreeCode: [accTreeCode],
      credit: [credit],
      debit: [debit],
      // clientId: [clientId],
      // clientName: [clientName],
      // buyInvoiceId: [buyInvoiceId],
      // notes: [notes],
      // amount: [amount],
      // costCenterId: [costCenterId],
      // bankId: [bankId],
      // bankName: [bankName],
      // treasuryId: [treasuryId],
      // treasuryName: [treasuryName],
      // supplierId: [supplierId],
      // isVatchecked: [isVatchecked],
      // vatVal: [vatVal],
      // taxNotes: [taxNotes],
    });
  }

  removeLine(i: number) {
    if (this.linesArray?.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  getCostCenters(): void {
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
              if (!this.manualRestriction) {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.IsDefault == true
                );
                this.manualRestrictionForm.patchValue({
                  currencyId: this.defaultCurrency.Id,
                });
              } else {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.Id == this.manualRestriction.CurencyId
                );
              }
            }
          })
        )
    );
  }

  changeCurrency(ev: any): void {
    if (ev) {
      if (ev.IsDefault) {
        this.manualRestrictionForm.patchValue({ exchangeRate: 1 });
      }
      this.defaultCurrency = ev;
    }
  }
  // /XtraAndPos_TreasuryManagement/CreateManualGeneralLedger
}
