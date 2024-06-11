import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  apiUrl,
  generalLookupsApi,
  treasuryManagementApi,
} from '@constants/api.constant';
import { E_USER_ROLE, USER_PROFILE } from '@constants/general.constant';
import { Toast } from '@enums/toast.enum';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-payment-voucher',
  templateUrl: './add-new-payment-voucher.component.html',
})
export class AddNewPaymentVoucherComponent implements OnInit {
  banks: any[];
  suppliers: any[];
  treasuries: any[];
  currencies: any[];
  costCenters: any[];
  banksInLine: any[];
  changedColumns: any;
  paymentVoucher: any;
  defaultCurrency: any;
  employeeTreasury: any;
  allColumns: any[] = [];
  invoiceLineKeys: any[];
  treasuriesInLine: any[];
  clientsData: any[] = [];
  suppliersData: any[] = [];
  E_USER_ROLE = E_USER_ROLE;
  subs: Subscription[] = [];
  clientInvoices: any[] = [];
  USER_PROFILE = USER_PROFILE;
  supplierInvoices: any[] = [];
  _selectedColumns: any[] = [];
  paymentVoucherForm: FormGroup;
  accTreeAccountsData: any[] = [];
  tableStorage = 'payment-voucher-form-table';
  defaultStorage = 'payment-voucher-form-default-selected';
  clientsApi = `${generalLookupsApi}/CustomerByTerm`;
  accountsApi = `${generalLookupsApi}/GetAccountExpensessByTrim`;
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
    { field: 'AccTreeCode', header: 'AccTreeCode' },
    { field: 'AccTreeId', header: 'accounts' },
    { field: 'Amount', header: 'amount' },
    { field: 'CostCenterId', header: 'costCenter' },
    { field: 'Notes', header: 'notes' },
    { field: 'IsVatchecked', header: 'includeVat' },
    { field: 'vatVal', header: 'vatValue' },
    { field: 'IsVatcheckedNotes', header: 'vatNotes' },
  ];

  fb = inject(FormBuilder);
  dataService = inject(DataService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  helpers = inject(HelpersService);
  toast = inject(ToastService);
  translate = inject(TranslateService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  elementRef = inject(ElementRef);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.paymentVoucher),
        tap(async (res) => {
          if (res?.IsSuccess) {
            this.paymentVoucher = res.Obj.TreasuryOut;
            this.initForm();
            await this.changeTreasuryType({
              value: this.paymentVoucher.TreasuryType,
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

  changeInHideShow(ev: any): void {
    this._selectedColumns = ev.value;
    let arr: any[] =
      this.helpers.getItemFromLocalStorage(this.defaultStorage) || [];
    let i = arr?.findIndex(
      (el) => el?.type === this.paymentVoucherForm.get('treasuryType')!.value
    );
    if (i >= 0) {
      arr[i].selected = this._selectedColumns;
    } else {
      arr.push({
        type: this.paymentVoucherForm.get('treasuryType')!.value,
        selected: this._selectedColumns,
      });
    }
    this.helpers.setItemToLocalStorage(this.defaultStorage, arr);
  }

  getTreasuryTransactionInit(): void {
    firstValueFrom(
      this.dataService
        .get(
          `${apiUrl}/XtraAndPos_TreasuryManagement/TreasuryTransactionInit?trxType=2`
        )
        .pipe(
          map((res) => res.Data),
          tap(async (res) => {
            if (res?.IsSuccess) {
              this.invoiceLineKeys = res.Obj.DetailsColumns;
              await this.InitTable();
              this.banks = res.Obj.Banks;
              this.treasuries = res.Obj.treasuries;
              this.costCenters = res.Obj.CostCenters;
              this.banksInLine = res.Obj.BankInMainBranch;
              this.treasuriesInLine = res.Obj.TreasuryInMainBranch;
              this.currencies = res.Obj.Currencyies;
              if (!this.paymentVoucher) {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.IsDefault == true
                );
                this.paymentVoucherForm.patchValue({
                  curencyId: this.defaultCurrency.Id,
                  docNo: res.Obj.docNo,
                  treasuryId: res.Obj.employee.TreasuryId,
                });
              } else {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.Id == this.paymentVoucher.CurencyId
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
        this.paymentVoucherForm.get('treasuryType')!.value
      );
  }

  initForm(): void {
    let id;
    let nameAr = 'سند صرف';
    let notes;
    let treasuryId;
    let ccenter;
    let docDate = new Date();
    let equivalentPrice = 0;
    let treasuryType = 1;
    let typeofpayment = 2;
    let mainBank;
    let docNoManual;
    let docNo;
    let totalAmount = 0;
    let totalVat = 0;
    let totalAfterVat = 0;
    let curencyId;
    let exchangeRate = 1;

    if (this.paymentVoucher) {
      id = this.paymentVoucher.Id;
      nameAr = this.paymentVoucher.NameAr;
      notes = this.paymentVoucher.Notes;
      treasuryId = this.paymentVoucher.TreasuryId;
      ccenter = this.paymentVoucher.MainCostCenter || null;
      docDate = new Date(this.paymentVoucher.DocDate);
      equivalentPrice = this.paymentVoucher.EquivalentPrice;
      treasuryType = this.paymentVoucher.TreasuryType;
      typeofpayment = this.paymentVoucher.Typeofpayment;
      mainBank = this.paymentVoucher.MainBank;
      docNoManual = this.paymentVoucher.DocNoManual;
      docNo = this.paymentVoucher.DocNo;
      totalAmount = this.paymentVoucher.TotalAmount;
      totalVat = this.paymentVoucher.TotalVat;
      totalAfterVat = this.paymentVoucher.TotalAfterVat;
      curencyId = this.paymentVoucher.CurencyId || null;
      exchangeRate = this.paymentVoucher.ExchangeRate;
    }

    this.paymentVoucherForm = this.fb.group({
      id: [id],
      docNo: [docNo],
      nameAr: [nameAr],
      docDate: [docDate],
      docNoManual: [docNoManual],
      typeofpayment: [typeofpayment],
      treasuryId: [treasuryId],
      mainBank: [mainBank],
      treasuryType: [treasuryType],
      ccenter: [ccenter],
      curencyId: [curencyId],
      exchangeRate: [exchangeRate],
      equivalentPrice: [equivalentPrice],
      notes: [notes],
      totalAmount: [totalAmount],
      totalVat: [totalVat],
      totalAfterVat: [totalAfterVat],
      treasuryTransactionOutDetails: this.fb.array([this.newLine()]),
    });
  }

  fillLinesFromApi(): void {
    if (this.paymentVoucher?.TreasuryTransactionOutDetails?.length) {
      this.linesArray.clear();
      this.paymentVoucher?.TreasuryTransactionOutDetails.forEach(
        (line: any, i: number) => {
          this.addNewLine(line);
          if (this.paymentVoucher.TreasuryType === 1) {
            this.accTreeAccountsData[i] = [
              {
                Id: line.AccTreeId,
                NameAr: line.AccTreeName,
                NameEn: line.AccTreeName,
              },
            ];
          }
          if (this.paymentVoucher.TreasuryType === 2) {
            this.getInvoicesByClientId(line.ClientId, i);
            this.clientsData[i] = [
              {
                Id: line.ClientId,
                NameAr: line.ClientName,
                NameEn: line.ClientName,
              },
            ];
          }
          if (this.paymentVoucher.TreasuryType === 5) {
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

  changeCurrency(ev: any): void {
    if (ev) {
      if (ev.IsDefault) {
        this.paymentVoucherForm.patchValue({ exchangeRate: 1 });
      }
      this.defaultCurrency = ev;
    }
  }

  get linesArray(): FormArray {
    return this.paymentVoucherForm.get(
      'treasuryTransactionOutDetails'
    ) as FormArray;
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
    let accTreeCode;
    let clientId;
    let clientName;
    let clientCode;
    let amount = 0;
    let notes;
    let bankId;
    let bankName;
    let supplierId;
    let supplierName;
    let supplierCode;
    let treasuryId;
    let treasuryName;
    let costCenterId;
    let buyInvoiceId;
    let isVatchecked;
    let vatVal = 0;
    let taxNotes;

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
      amount = value.Amount;
      notes = value.Notes;
      bankId = value.BankId || null;
      bankName = value.BankName;
      treasuryId = value.TreasuryId || null;
      treasuryName = value.TreasuryName;
      costCenterId = value.CostCenterId || null;
      buyInvoiceId = value.BuyInvoiceId ? value.BuyInvoiceId : null;
      isVatchecked = value.IsVatchecked;
      vatVal = value.vatVal;
      taxNotes = value.IsVatcheckedNotes;
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
      buyInvoiceId: [buyInvoiceId],
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
      isVatchecked: [isVatchecked],
      vatVal: [vatVal],
      taxNotes: [taxNotes],
      supplierName: [supplierName],
      supplierCode: [supplierCode],
    });
  }

  removeLine(i: number): void {
    if (this.linesArray?.length > 1) {
      let form = this.linesArray.controls[i];
      if (form.get('isVatchecked')!.value) {
        this.changeVat(false, i);
      }
      this.linesArray.removeAt(i);
      this.changeAmount(i);
    }
  }

  async changeTreasuryType(ev: any): Promise<void> {
    let commonDefaultSelected = this.defaultSelected.slice(
      this.defaultSelected.length - 6
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
        { field: 'BuyInvoiceId', header: 'invoices' },
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
        { field: 'BuyInvoiceId', header: 'invoices' },
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

  changePaymentType(ev: any): void {
    if (ev.value === 1) {
      this.paymentVoucherForm.patchValue({ treasuryId: null });
    }
    if (ev.value === 2) {
      this.paymentVoucherForm.patchValue({
        mainBank: null,
        treasuryId: this.employeeTreasury,
      });
    }
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

  selectAccTree(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ accTreeCode: ev.AccCode });
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

  changeAmount(i: number): void {
    let form = this.linesArray.controls[i];
    let isVatchecked = form?.get('isVatchecked')!.value;
    let equivalentPrice = this.linesArray.controls
      .map((line: any) => +line.value?.amount)
      .reduce((acc, curr) => acc + curr, 0);
    this.paymentVoucherForm.patchValue({
      equivalentPrice,
      totalAmount: equivalentPrice,
      totalAfterVat: equivalentPrice,
    });
    if (isVatchecked) {
      this.changeVat(isVatchecked, i);
    }
  }

  changeVat(ev: any, i: number): void {
    let equivalentPrice = this.paymentVoucherForm.value.equivalentPrice;
    let form = this.linesArray.controls[i];
    let vatVal = form.get('vatVal')!.value;
    let amount = form.get('amount')!.value;
    let isChecked = ev?.target?.checked ?? ev;

    if (isChecked) {
      let netAmount = Math.round((amount / 1.15) * 100) / 100;
      vatVal = Math.round((amount - netAmount) * 100) / 100;
      form.patchValue({ vatVal });
    } else {
      form.patchValue({ vatVal: 0, isVatchecked: false });
    }
    let totalVat = this.linesArray.controls
      .map((line: any) => +line.value?.vatVal)
      .reduce((acc, curr) => acc + curr, 0);

    this.paymentVoucherForm.patchValue({
      totalAmount: equivalentPrice - totalVat,
      totalVat,
    });
  }

  submit(): void {
    this.spinner.show();
    let formValue = {
      ...this.paymentVoucherForm.value,
      docDate: this.paymentVoucherForm.value.docDate.toISOString(),
      treasuryTransactionOutDetails: this.helpers.removeEmptyLines(
        this.linesArray
      ),
    };
    if (this.paymentVoucher) {
      firstValueFrom(
        this.dataService
          .put(`${treasuryManagementApi}/updateTreasuryOut`, formValue)
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
        .post(`${treasuryManagementApi}/CreateTreasuryOut`, formValue)
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
