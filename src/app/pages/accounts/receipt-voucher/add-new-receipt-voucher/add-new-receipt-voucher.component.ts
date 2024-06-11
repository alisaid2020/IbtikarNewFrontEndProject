import {
  apiUrl,
  generalLookupsApi,
  treasuryManagementApi,
} from '@constants/api.constant';
import { Toast } from '@enums/toast.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '@services/data.service';
import { ToastService } from '@services/toast-service';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from '@services/table.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HelpersService } from '@services/helpers.service';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { E_USER_ROLE, USER_PROFILE } from '@constants/general.constant';

@Component({
  selector: 'app-add-new-receipt-voucher',
  templateUrl: './add-new-receipt-voucher.component.html',
})
export class AddNewReceiptVoucherComponent implements OnInit {
  banks: any[];
  suppliers: any[];
  currencies: any[];
  treasuries: any[];
  banksInLine: any[];
  costCenters: any[];
  receiptVoucher: any;
  changedColumns: any;
  defaultCurrency: any;
  employeeTreasury: any;
  invoiceLineKeys: any[];
  allColumns: any[] = [];
  clientsData: any[] = [];
  treasuriesInLine: any[];
  suppliersData: any[] = [];
  subs: Subscription[] = [];
  E_USER_ROLE = E_USER_ROLE;
  clientInvoices: any[] = [];
  USER_PROFILE = USER_PROFILE;
  supplierInvoices: any[] = [];
  _selectedColumns: any[] = [];
  receiptVoucherForm: FormGroup;
  accTreeAccountsData: any[] = [];
  tableStorage = 'receipt-voucher-form-table';
  clientsApi = `${generalLookupsApi}/CustomerByTerm`;
  accountsApi = `${generalLookupsApi}/GetAccountsByTrim`;
  defaultStorage = 'receipt-voucher-form-default-selected';
  suppliersApi = `${apiUrl}/XtraAndPOS_Global/SupplierByTerm`;
  typeOfDealing = [
    { value: 1, name: 'bank' },
    { value: 2, name: 'safe' },
  ];
  treasuryTypes = [
    { value: 1, name: 'accountsTree' },
    { value: 2, name: 'clients' },
    { value: 3, name: 'bank' },
    { value: 4, name: 'anotherSafe' },
    { value: 5, name: 'suppliers' },
  ];
  defaultSelected = [
    { field: 'ClientCode', header: 'ClientCode' },
    { field: 'ClientId', header: 'clients' },
    { field: 'SaleInvoiceId', header: 'invoices' },
    { field: 'Amount', header: 'amount' },
    { field: 'CostCenterId', header: 'costCenter' },
    { field: 'Notes', header: 'notes' },
  ];

  router = inject(Router);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);
  tableService = inject(TableService);
  translate = inject(TranslateService);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.receiptVoucher),
        tap(async (res) => {
          if (res?.IsSuccess) {
            this.receiptVoucher = res.Obj.Treasury;
            this.initForm();
            await this.changeTreasuryType({
              value: this.receiptVoucher.TreasuryType,
            });
            this.fillLinesFromApi();
            return;
          }
          this.initForm();
        })
      )
    );
    this.getTreasuryTransactionInit();
  }

  async InitTable() {
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
    );
  }

  getTreasuryTransactionInit(): void {
    firstValueFrom(
      this.dataService
        .get(
          `${apiUrl}/XtraAndPos_TreasuryManagement/TreasuryTransactionInit?trxType=1`
        )
        .pipe(
          map((res) => res.Data),
          tap(async (res) => {
            if (res?.IsSuccess) {
              this.invoiceLineKeys = res.Obj.DetailsColumns;
              await this.InitTable();
              this.treasuries = res.Obj.treasuries;
              this.banks = res.Obj.Banks;
              this.costCenters = res.Obj.CostCenters;
              this.banksInLine = res.Obj.BankInMainBranch;
              this.treasuriesInLine = res.Obj.TreasuryInMainBranch;
              this.currencies = res.Obj.Currencyies;
              if (!this.receiptVoucher) {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.IsDefault == true
                );
                this.receiptVoucherForm.patchValue({
                  curencyId: this.defaultCurrency.Id,
                  docNo: res.Obj.docNo,
                  treasuryId: res.Obj.employee.TreasuryId,
                });
              } else {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.Id == this.receiptVoucher.CurencyId
                );
              }
            }
          })
        )
    );
  }

  async initTableColumns() {
    this.allColumns = this.tableService.tableColumns(
      this.invoiceLineKeys,
      this.defaultSelected
    );
    [this.changedColumns, this._selectedColumns] =
      await this.tableService.storageFn(
        this.defaultSelected,
        this.defaultStorage,
        this._selectedColumns,
        this.receiptVoucherForm.get('treasuryType')!.value
      );
  }

  changeInHideShow(ev: any): void {
    this._selectedColumns = ev.value;
    let arr: any[] =
      this.helpers.getItemFromLocalStorage(this.defaultStorage) || [];
    let i = arr?.findIndex(
      (el) => el?.type === this.receiptVoucherForm.get('treasuryType')!.value
    );
    if (i >= 0) {
      arr[i].selected = this._selectedColumns;
    } else {
      arr.push({
        type: this.receiptVoucherForm.get('treasuryType')!.value,
        selected: this._selectedColumns,
      });
    }
    this.helpers.setItemToLocalStorage(this.defaultStorage, arr);
  }

  initForm() {
    let id;
    let docNo;
    let docDate = new Date();
    let nameAr = 'سند قبض';
    let notes;
    let treasuryType = 2;
    let treasuryId;
    let equivalentPrice = 0;
    let typeofpayment = 2;
    let ccenter;
    let docNoManual;
    let isMobile = false;
    let exchangeRate = 1;
    let curencyId;
    let mainBank;

    if (this.receiptVoucher) {
      id = this.receiptVoucher.Id;
      docDate = new Date(this.receiptVoucher.DocDate);
      docNo = this.receiptVoucher.DocNo;
      nameAr = this.receiptVoucher.NameAr;
      notes = this.receiptVoucher.Notes;
      treasuryType = this.receiptVoucher.TreasuryType;
      treasuryId = this.receiptVoucher.TreasuryId;
      equivalentPrice = this.receiptVoucher.EquivalentPrice;
      typeofpayment = this.receiptVoucher.Typeofpayment;
      ccenter = this.receiptVoucher.MainCostCenter || null;
      docNoManual = this.receiptVoucher.DocNoManual;
      isMobile = this.receiptVoucher.IsMobile;
      exchangeRate = this.receiptVoucher.ExchangeRate;
      curencyId = this.receiptVoucher.CurencyId || null;
      mainBank = this.receiptVoucher.MainBank;
    }

    this.receiptVoucherForm = this.fb.group({
      id: [id],
      docNo: [docNo],
      nameAr: [nameAr],
      docDate: [docDate],
      typeofpayment: [typeofpayment],
      treasuryId: [treasuryId],
      treasuryType: [treasuryType],
      ccenter: [ccenter],
      curencyId: [curencyId],
      exchangeRate: [exchangeRate],
      notes: [notes],
      equivalentPrice: [equivalentPrice, [Validators.required]],
      docNoManual: [docNoManual],
      isMobile: [isMobile],
      mainBank: [mainBank],
      treasuryTransactionDetails: this.fb.array([this.newLine()]),
    });
  }

  fillLinesFromApi(): void {
    if (this.receiptVoucher?.TreasuryTransactionsDetails?.length) {
      this.linesArray.clear();
      this.receiptVoucher.TreasuryTransactionsDetails.forEach(
        (line: any, i: number) => {
          this.addNewLine(line);
          if (this.receiptVoucher.TreasuryType === 1) {
            this.accTreeAccountsData[i] = [
              {
                Id: line.AccTreeId,
                NameAr: line.AccTreeName,
                NameEn: line.AccTreeName,
              },
            ];
          }
          if (this.receiptVoucher.TreasuryType === 2) {
            this.getInvoicesByClientId(line.ClientId, i);
            this.clientsData[i] = [
              {
                Id: line.ClientId,
                NameAr: line.ClientName,
                NameEn: line.ClientName,
              },
            ];
          }
          if (this.receiptVoucher.TreasuryType === 5) {
            this.getInvoicesBySupplierId(line.SupplierId, i);
            this.suppliersData[i] = [
              {
                Id: line.SupplierId,
                NameAr: line.SupplierName,
                NameEn: line.SupplierName,
              },
            ];
          }
        }
      );
    }
  }

  get linesArray(): FormArray {
    return this.receiptVoucherForm.get(
      'treasuryTransactionDetails'
    ) as FormArray;
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  removeLine(i: number) {
    if (this.linesArray?.length > 1) {
      this.linesArray.removeAt(i);
      this.changeAmount();
    }
  }

  newLine(value?: any) {
    let accTreeId;
    let accTreeCode;
    let clientId;
    let clientName;
    let clientCode;
    let saleInvoiceId;
    let amount;
    let supplierId;
    let supplierName;
    let supplierCode;
    let treasuryId;
    let costCenterId;
    let bankId;
    let treasuryName;
    let bankName;
    let notes;

    if (value) {
      accTreeId = value.AccTreeId
        ? {
            Id: value.AccTreeId,
          }
        : null;
      clientId = value.ClientId
        ? {
            Id: value.ClientId,
          }
        : null;
      supplierId = value.SupplierId ? { Id: value.SupplierId } : null;
      clientName = value.ClientName;
      saleInvoiceId = value.SaleInvoiceId ? value.SaleInvoiceId : null;
      amount = value.Amount;
      treasuryId = value.TreasuryId || null;
      costCenterId = value.CostCenterId || null;
      bankId = value.BankId || null;
      treasuryName = value.TreasuryName;
      bankName = value.BankName;
      notes = value.Notes;
      supplierName = value?.SupplierName;
      clientCode = value?.ClientCode ? { ClientCode: value?.ClientCode } : null;
      accTreeCode = value?.AccTreeCode ? { AccCode: value?.AccTreeCode } : null;
      supplierCode = value?.SupplierCode
        ? { SupplierCode: value?.SupplierCode }
        : null;
    }
    return this.fb.group({
      clientId: [clientId],
      clientName: [clientName],
      clientCode: [clientCode],
      saleInvoiceId: [saleInvoiceId],
      notes: [notes],
      amount: [amount],
      costCenterId: [costCenterId],
      accTreeId: [accTreeId],
      accTreeCode: [accTreeCode],
      bankId: [bankId],
      bankName: [bankName],
      treasuryId: [treasuryId],
      treasuryName: [treasuryName],
      supplierId: [supplierId],
      supplierName: [supplierName],
      supplierCode: [supplierCode],
    });
  }

  selectClientInLine(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({
        clientName: ev.NameAr,
        clientCode: ev?.ClientCode || null,
      });
      this.getInvoicesByClientId(ev.Id, i);
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'client', this.elementRef);
      });
    }
  }

  selectClientCodeInLine(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ clientId: ev.Id, clientName: ev.NameAr });
      this.getInvoicesByClientId(ev.Id, i);
      this.clientsData[i] = [
        {
          Id: ev.Id,
          NameAr: ev.NameAr,
          NameEn: ev.NameEn,
        },
      ];
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'clientCode', this.elementRef);
      });
    }
  }

  getInvoicesByClientId(id: number, i: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_SaleInvoice/GetInvoicesByClientIs?id=${id}`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.clientInvoices[i] = res.Obj;
            }
          })
        )
    );
  }

  async changeTreasuryType(ev: any) {
    let commonDefaultSelected = this.defaultSelected.slice(
      this.defaultSelected.length - 3
    );
    if (ev?.value === 1) {
      this.defaultSelected = [
        { field: 'AccTreeCode', header: 'AccTreeCode' },
        { field: 'AccTreeId', header: 'accounts' },
        ...commonDefaultSelected,
      ];
    }
    if (ev?.value === 2) {
      this.defaultSelected = [
        { field: 'ClientCode', header: 'ClientCode' },
        { field: 'ClientId', header: 'clients' },
        { field: 'SaleInvoiceId', header: 'invoices' },
        ...commonDefaultSelected,
      ];
    }
    if (ev?.value === 3) {
      this.defaultSelected = [
        { field: 'BankId', header: 'banks' },
        ...commonDefaultSelected,
      ];
    }
    if (ev?.value === 4) {
      this.defaultSelected = [
        { field: 'TreasuryId', header: 'safe' },
        ...commonDefaultSelected,
      ];
    }
    if (ev?.value === 5) {
      this.defaultSelected = [
        { field: 'SupplierCode', header: 'SupplierCode' },
        { field: 'SupplierId', header: 'suppliers' },
        { field: 'SaleInvoiceId', header: 'invoices' },
        ...commonDefaultSelected,
      ];
    }
    this._selectedColumns = this.defaultSelected;
    await this.InitTable();
    this.linesArray.clear();
    this.addNewLine();
    this.accTreeAccountsData = [];
    this.suppliersData = [];
    this.supplierInvoices = [];
    this.clientsData = [];
    this.clientInvoices = [];
  }

  selectAccTree(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ accTreeCode: ev?.AccCode });
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'accTree', this.elementRef);
      });
    }
  }

  selectAccTreeCode(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ accTreeId: ev?.Id });
      this.accTreeAccountsData[i] = [
        {
          Id: ev.Id,
          NameAr: ev.NameAr,
          NameEn: ev.NameEn,
        },
      ];
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'accTreeCode', this.elementRef);
      });
    }
  }

  selectBankInLine(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ bankName: ev.NameAr });
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'bank', this.elementRef);
      });
    }
  }

  selectSupplier(ev: any, i: any): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({
        supplierName: ev.NameAr,
        supplierCode: ev?.SupplierCode || null,
      });
      this.getInvoicesBySupplierId(ev.Id, i);
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'supplier', this.elementRef);
      });
    }
  }

  selectSupplierCode(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({
        supplierId: ev?.Id,
        supplierName: ev.NameAr,
      });
      this.suppliersData[i] = [
        {
          Id: ev?.Id,
          NameAr: ev.NameAr,
          NameEn: ev.NameEn,
        },
      ];
      this.getInvoicesBySupplierId(ev.Id, i);
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'supplierCode', this.elementRef);
      });
    }
  }

  selectTreasuryInLine(ev: any, i: number) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ treasuryName: ev.NameAr });
      this.addNewLine();
      setTimeout(() => {
        this.helpers.focusOnNextRow(i + 1, 'treasury', this.elementRef);
      });
    }
  }

  getInvoicesBySupplierId(id: number, i: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_BuyInvoice/GetInvoicesBySuppliers?id=${id}`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.supplierInvoices[i] = res?.Obj;
            }
          })
        )
    );
  }

  changeAmount(): void {
    let equivalentPrice = this.linesArray.controls
      .map((line: any) => +line.value?.amount)
      .reduce((acc, curr) => acc + curr, 0);
    this.receiptVoucherForm.patchValue({ equivalentPrice });
  }

  changePaymentType(ev: any): void {
    if (ev.value === 1) {
      this.receiptVoucherForm.patchValue({ treasuryId: null });
    }
    if (ev.value === 2) {
      this.receiptVoucherForm.patchValue({
        mainBank: null,
        treasuryId: this.employeeTreasury,
      });
    }
  }

  changeCurrency(ev: any): void {
    if (ev) {
      if (ev.IsDefault) {
        this.receiptVoucherForm.patchValue({ exchangeRate: 1 });
      }
      this.defaultCurrency = ev;
    }
  }

  submit(): void {
    this.spinner.show();
    let formValue = {
      ...this.receiptVoucherForm.value,
      docDate: this.receiptVoucherForm.value.docDate.toISOString(),
      treasuryTransactionDetails: this.helpers.removeEmptyLines(
        this.linesArray
      ),
    };
    if (this.receiptVoucher) {
      firstValueFrom(
        this.dataService
          .put(`${treasuryManagementApi}/updateTreasury`, formValue)
          .pipe(
            tap((res) => {
              if (res.IsSuccess) {
                this.spinner.hide();
                this.toast.show(Toast.updated, { classname: Toast.success });
                this.router.navigateByUrl('/receipt-vouchers');
              }
            })
          )
      );
      return;
    }
    firstValueFrom(
      this.dataService
        .post(`${treasuryManagementApi}/CreateTreasury`, formValue)
        .pipe(
          tap((res) => {
            if (res.IsSuccess) {
              this.spinner.hide();
              this.toast.show(Toast.added, { classname: Toast.success });
              this.router.navigateByUrl('/receipt-vouchers');
            }
          })
        )
    );
  }
}
