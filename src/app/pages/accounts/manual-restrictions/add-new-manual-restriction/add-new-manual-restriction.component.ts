import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  apiUrl,
  generalLookupsApi,
  treasuryManagementApi,
} from '@constants/api.constant';
import { E_USER_ROLE } from '@constants/general.constant';
import { Toast } from '@enums/toast.enum';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-manual-restriction',
  templateUrl: './add-new-manual-restriction.component.html',
})
export class AddNewManualRestrictionComponent implements OnInit {
  currencies: any[];
  costCenters: any[];
  changedColumns: any;
  defaultCurrency: any;
  manualRestriction: any;
  allColumns: any[] = [];
  E_USER_ROLE = E_USER_ROLE;
  docNo = new FormControl();
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  treasuryTypesData: any[] = [];
  totalDebit = new FormControl(0);
  totalCredit = new FormControl(0);
  manualRestrictionForm: FormGroup;
  tableStorage = 'manual-restriction-form-table';
  defaultStorage = 'manual-restriction-form-default-selected';
  treasuryTypesApi = `${generalLookupsApi}/GetSearchTreasuryTypesServiceTrim`;
  defaultSelected = [
    { field: 'treasuryType', header: 'treasuryTypes' },
    { field: 'treasureTypeName', header: 'treasureTypeName' },
    { field: 'Credit', header: 'CrAmount' },
    { field: 'Debit', header: 'DrAmount' },
    { field: 'CostCenterId', header: 'costCenter' },
    { field: 'Notes', header: 'notes' },
  ];
  invoiceLineKeys = [
    'treasuryType',
    'Debit',
    'Credit',
    'CostCenterId',
    'Notes',
  ];

  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);
  elementRef = inject(ElementRef);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.manualRestriction),
        tap((res) => {
          if (res?.IsSuccess) {
            this.manualRestriction = res.Obj.Treasury;
            this.initForm();
            this.fillLinesFromApi();
            return;
          }
          this.initForm();
        })
      )
    );
    this.getTreasuryTransactionInit();
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
    );
  }
  changeInHideShow(ev: any): void {
    this._selectedColumns = ev.value;
    this.helpers.setItemToLocalStorage(
      this.defaultStorage,
      this._selectedColumns
    );
    if (this.helpers.checkItemFromLocalStorage(this.tableStorage)) {
      let ts = this.helpers.getItemFromLocalStorage(this.tableStorage);
      let tsIndex: any = ts?.columnOrder.findIndex(
        (el: any) => el === ev.itemValue.header
      );
      if (tsIndex >= 0) {
        ts.columnOrder.splice(tsIndex, 1);
      } else {
        ts.columnOrder.push(ev.itemValue.field);
      }
      this.helpers.setItemToLocalStorage(this.tableStorage, ts);
    }
  }

  getTreasuryTransactionInit(): void {
    firstValueFrom(
      this.dataService
        .get(
          `${apiUrl}/XtraAndPos_TreasuryManagement/TreasuryTransactionInit?trxType=3`
        )
        .pipe(
          map((res) => res.Data),
          tap((res) => {
            if (res?.IsSuccess) {
              this.costCenters = res.Obj.CostCenters;
              this.currencies = res.Obj.Currencyies;
              if (!this.manualRestriction) {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.IsDefault == true
                );
                this.manualRestrictionForm.patchValue({
                  currencyId: this.defaultCurrency.Id,
                });
                this.docNo.setValue(res.Obj.docNo);
              } else {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.Id == this.manualRestriction.CurrencyId
                );
              }
            }
          })
        )
    );
  }

  async initTableColumns() {
    this.allColumns = this.tableService.tableColumns(this.invoiceLineKeys);
    [this.changedColumns, this._selectedColumns] =
      await this.tableService.storageFn(
        this.defaultSelected,
        this.defaultStorage,
        this._selectedColumns
      );
  }

  initForm(): void {
    let id;
    let docName = 'قيد يدوي';
    let docDate = new Date();
    let equivalentPrice = 0;
    let ccenter;
    let currencyId;
    let docNoManual;
    let exchangeRate = 1;
    let notes;
    let docType;

    if (this.manualRestriction) {
      id = this.manualRestriction.Id;
      docName = this.manualRestriction.DocName;
      docDate = new Date(this.manualRestriction.DocDate);
      ccenter = this.manualRestriction?.CostCenterId || null;
      currencyId = this.manualRestriction.CurrencyId;
      docNoManual = this.manualRestriction.DocNoManual;
      exchangeRate = this.manualRestriction.ExchangePriceId;
      notes = this.manualRestriction.Notes;
      this.docNo.setValue(this.manualRestriction.DocNo);
      this.totalCredit.setValue(this.manualRestriction.CrAmount);
      this.totalDebit.setValue(this.manualRestriction.DrAmount);
    }

    this.manualRestrictionForm = this.fb.group({
      id: [id],
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

  fillLinesFromApi(): void {
    if (this.manualRestriction?.GlDetails?.length) {
      this.linesArray.clear();
      this.manualRestriction?.GlDetails.forEach((line: any, i: number) => {
        this.addNewLine(line);
        let form = this.linesArray.controls[i];
        if (line?.ClientId) {
          form.patchValue({
            treasureType: { Id: line.ClientId },
            treasureTypeName:
              this.translate.currentLang === 'ar' ? 'عملاء' : 'Clients',
          });
          this.treasuryTypesData[i] = [
            {
              Id: line.ClientId,
              NameAr: line?.ClientName,
              NameEn: line?.ClientName,
            },
          ];
        }
        if (line?.MainBank) {
          form.patchValue({
            treasureType: { Id: line.MainBank },
            treasureTypeName:
              this.translate.currentLang === 'ar' ? 'بنوك' : 'Banks',
          });
          this.treasuryTypesData[i] = [
            {
              Id: line.MainBank,
              NameAr: line?.BankName,
              NameEn: line?.BankName,
            },
          ];
        }
        if (line?.AccTreeId) {
          form.patchValue({
            treasureType: { Id: line.AccTreeId },
            treasureTypeName:
              this.translate.currentLang === 'ar'
                ? 'شجرة الحسابات'
                : 'Acc Tree',
          });
          this.treasuryTypesData[i] = [
            {
              Id: line.AccTreeId,
              NameAr: line?.AccTreeName,
              NameEn: line?.AccTreeName,
            },
          ];
        }
        if (line?.TreasuryId) {
          form.patchValue({
            treasureType: { Id: line.TreasuryId },
            treasureTypeName:
              this.translate.currentLang === 'ar' ? 'الخزينة' : 'Safe',
          });
          this.treasuryTypesData[i] = [
            {
              Id: line.TreasuryId,
              NameAr: line?.treasuryName,
              NameEn: line?.treasuryName,
            },
          ];
        }
      });
    }
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
    let treasuryName;
    let accTreeName;
    let accTreeCode;
    let credit = 0;
    let debit = 0;
    let docName = 'قيد يدوي';
    let treasuryId;
    let mainBank;
    let bankName;
    let costCenterId;
    let clientId;
    let clientName;
    let notes;
    let treasureType;
    let treasureTypeName;
    if (value) {
      accTreeId = value?.AccTreeId || null;
      treasuryName = value?.TreasuryName;
      accTreeName = value?.AccTreeName;
      accTreeCode = value.AccTreeCode;
      credit = value?.Credit;
      debit = value?.Debit;
      docName = value?.DocName;
      treasuryId = value?.TreasuryId || null;
      mainBank = value?.MainBank || null;
      bankName = value?.BankName;
      costCenterId = value?.CostCenterId || null;
      clientId = value.ClientId || null;
      clientName = value?.ClientName;
      notes = value?.Notes;
    }
    return this.fb.group({
      accTreeId: [accTreeId],
      accTreeName: [accTreeName],
      accTreeCode: [accTreeCode],
      credit: [credit],
      debit: [debit],
      docName: [docName],
      clientId: [clientId],
      clientName: [clientName],
      notes: [notes],
      costCenterId: [costCenterId],
      mainBank: [mainBank],
      bankName: [bankName],
      treasuryId: [treasuryId],
      treasuryName: [treasuryName],
      treasureType: [treasureType],
      treasureTypeName: [treasureTypeName],
    });
  }

  removeLine(i: number): void {
    if (this.linesArray?.length > 1) {
      this.linesArray.removeAt(i);
      this.getTotalCredit();
      this.getTotalDebit();
    }
  }

  changeCurrency(ev: any): void {
    if (ev) {
      if (ev.IsDefault) {
        this.manualRestrictionForm.patchValue({ exchangeRate: 1 });
      }
      this.defaultCurrency = ev;
    }
  }

  selectTreasuryType(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev?.IsClient) {
      form.patchValue({
        clientId: ev.Id,
        clientName: ev.NameAr,
        treasureTypeName:
          this.translate.currentLang === 'ar' ? 'عملاء' : 'Clients',
        accTreeId: null,
        accTreeName: null,
        treasuryId: null,
        treasuryName: null,
        accTreeCode: null,
        mainBank: null,
        bankName: null,
      });
    }
    if (ev?.IsBank) {
      form.patchValue({
        mainBank: ev.Id,
        bankName: ev.NameAr,
        treasureTypeName:
          this.translate.currentLang === 'ar' ? 'بنوك' : 'Banks',
        clientId: null,
        clientName: null,
        accTreeId: null,
        accTreeName: null,
        treasuryId: null,
        treasuryName: null,
        accTreeCode: null,
      });
    }
    if (ev?.IsAcctree) {
      form.patchValue({
        accTreeId: ev.Id,
        accTreeName: ev.NameAr,
        accTreeCode: ev.AccCode,
        treasureTypeName:
          this.translate.currentLang === 'ar' ? 'شجرة الحسابات' : 'Acc Tree',
        mainBank: null,
        bankName: null,
        clientId: null,
        clientName: null,
        treasuryId: null,
        treasuryName: null,
      });
    }
    if (ev?.IsTreasury) {
      form.patchValue({
        accTreeId: null,
        accTreeName: null,
        accTreeCode: null,
        mainBank: null,
        bankName: null,
        clientId: null,
        clientName: null,
        treasuryId: ev.Id,
        treasuryName: ev.NameAr,
        treasureTypeName:
          this.translate.currentLang === 'ar' ? 'الخزينة' : 'Safe',
      });
    }
    this.addNewLine();
    setTimeout(() => {
      this.helpers.focusOnNextRow(i + 1, 'treasuryType', this.elementRef);
    });
  }

  getTotalCredit(): void {
    let totalCredit = this.linesArray.controls
      .map((line: any) => +line.value?.credit)
      .reduce((acc, curr) => acc + curr, 0);
    totalCredit = Math.round(totalCredit * 100) / 100;
    this.totalCredit.setValue(totalCredit);
  }

  getTotalDebit(): void {
    let totalDebit = this.linesArray.controls
      .map((line: any) => +line.value?.debit)
      .reduce((acc, curr) => acc + curr, 0);
    totalDebit = Math.round(totalDebit * 100) / 100;
    this.totalDebit.setValue(totalDebit);
  }

  submit(): void {
    if (
      this.totalDebit.value !== this.totalCredit.value ||
      this.totalDebit.value == 0
    ) {
      this.toast.show('unbalancedRestriction', {
        classname: Toast.error,
      });
      return;
    }
    this.spinner.show();
    let formValue = {
      ...this.manualRestrictionForm.value,
      docDate: this.manualRestrictionForm.value.docDate.toISOString(),
      glDetail: this.helpers.removeEmptyLines(this.linesArray),
    };
    if (this.manualRestriction) {
      firstValueFrom(
        this.dataService
          .put(`${treasuryManagementApi}/updateManualGeneralLedger`, formValue)
          .pipe(
            tap((res) => {
              if (res.IsSuccess) {
                this.spinner.hide();
                this.toast.show(Toast.updated, { classname: Toast.success });
                this.router.navigateByUrl('/manual-restrictions');
              }
            })
          )
      );
      return;
    }
    firstValueFrom(
      this.dataService
        .post(`${treasuryManagementApi}/CreateManualGeneralLedger`, formValue)
        .pipe(
          tap((res) => {
            if (res.IsSuccess) {
              this.spinner.hide();
              this.toast.show(Toast.added, {
                classname: Toast.success,
              });
              this.router.navigateByUrl('/manual-restrictions');
            }
          })
        )
    );
  }
}
