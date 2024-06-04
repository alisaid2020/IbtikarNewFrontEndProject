import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
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
  treasuryTypesApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetSearchTreasuryTypesServiceTrim`;
  defaultSelected = [
    { field: 'treasuryType', header: 'treasuryType' },
    { field: 'Debit', header: 'Debit' },
    { field: 'Credit', header: 'Credit' },
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
    this.getCostCenters();
    this.getCurrencies();
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
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
      console.log(this.manualRestriction);
      id = this.manualRestriction.Id;
      docName = this.manualRestriction.DocName;
      docDate = new Date(this.manualRestriction.DocDate);
      ccenter = this.manualRestriction?.CostCenterId || null;
      currencyId = this.manualRestriction.CurrencyId;
      docNoManual = this.manualRestriction.DocNoManual;
      exchangeRate = this.manualRestriction.ExchangeRate;
      notes = this.manualRestriction.Notes;
      docType = this.manualRestriction.DocType;
      this.docNo.setValue(this.manualRestriction.DocNo);
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
          form.patchValue({ treasureType: { Id: line.ClientId } });
          this.treasuryTypesData[i] = [
            {
              Id: line.ClientId,
              NameAr: line?.ClientName,
              NameEn: line?.ClientName,
            },
          ];
        }
        if (line?.MainBank) {
          form.patchValue({ treasureType: { Id: line.MainBank } });
          this.treasuryTypesData[i] = [
            {
              Id: line.MainBank,
              NameAr: line?.BankName,
              NameEn: line?.BankName,
            },
          ];
        }
        if (line?.AccTreeId) {
          form.patchValue({ treasureType: { Id: line.AccTreeId } });
          this.treasuryTypesData[i] = [
            {
              Id: line.AccTreeId,
              NameAr: line?.AccTreeName,
              NameEn: line?.AccTreeName,
            },
          ];
        }
        if (line?.TreasuryId) {
          form.patchValue({ treasureType: { Id: line.TreasuryId } });
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
    });
  }

  removeLine(i: number) {
    if (this.linesArray?.length > 1) {
      this.linesArray.removeAt(i);
      this.getTotalCredit();
      this.getTotalDebit();
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
                  (el) => el.Id == this.manualRestriction.CurrencyId
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

  selectTreasuryType(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev?.IsClient) {
      form.patchValue({
        clientId: ev.Id,
        clientName: ev.NameAr,
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
      });
    }
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
    this.spinner.show();
    if (this.manualRestriction) {
      firstValueFrom(
        this.dataService
          .put(
            `${apiUrl}/XtraAndPos_TreasuryManagement/updateManualGeneralLedger`,
            this.manualRestrictionForm.value
          )
          .pipe(
            tap((res) => {
              if (res.IsSuccess) {
                this.spinner.hide();
                this.toast.show(Toast.updated, { classname: Toast.success });
                this.router.navigateByUrl('/payment-vouchers');
              }
            })
          )
      );
      return;
    }
    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPos_TreasuryManagement/CreateManualGeneralLedger`,
          this.manualRestrictionForm.value
        )
        .pipe(
          tap((res) => {
            if (res.IsSuccess) {
              this.spinner.hide();
              this.toast.show(Toast.added, { classname: Toast.success });
              this.router.navigateByUrl('/payment-vouchers');
            }
          })
        )
    );
  }
}
