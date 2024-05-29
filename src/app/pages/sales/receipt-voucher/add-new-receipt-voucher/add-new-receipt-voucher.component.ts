import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { E_USER_ROLE, USER_PROFILE } from '@constants/general.constant';
import { Toast } from '@enums/toast.enum';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-receipt-voucher',
  templateUrl: './add-new-receipt-voucher.component.html',
})
export class AddNewReceiptVoucherComponent implements OnInit {
  banks: any[];
  banksInLine: any[];
  treasuries: any[];
  treasuriesInLine: any[];
  currencies: any[];
  costCenters: any[];
  clientInvoices: any[];
  supplierInvoices: any[];
  suppliers: any[];
  changedColumns: any;
  allColumns: any[] = [];
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  receiptVoucherForm: FormGroup;
  E_USER_ROLE = E_USER_ROLE;
  USER_PROFILE = USER_PROFILE;
  tableStorage = 'receipt-voucher-form-table';
  defaultStorage = 'receipt-voucher-form-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  accountsApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetAccountsByTrim`;
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
    { field: 'clientId', header: 'clients' },
    { field: 'SaleInvoiceId', header: 'invoices' },
    { field: 'Amount', header: 'amount' },
    { field: 'costCenterId', header: 'costCenter' },
    { field: 'Notes', header: 'notes' },
  ];
  invoiceLineKeys = [
    'AccTreeId',
    'clientId',
    'SaleInvoiceId',
    'Amount',
    'Notes',
  ];

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }

  fb = inject(FormBuilder);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);
  toast = inject(ToastService);
  translate = inject(TranslateService);
  tableService = inject(TableService);
  helpers = inject(HelpersService);

  async ngOnInit() {
    this.initForm();
    this.getTreasuries();
    this.getEmployeeTreasury();
    this.getBanks();
    this.getCostCenters();
    this.getCurrencies();
    this.getBanksInLine();
    this.getTreasuriesInLine();
    this.getSuppliers();
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
              let defaultCurrency = this.currencies.find(
                (el) => el.IsDefault == true
              );
              this.receiptVoucherForm.patchValue({
                curencyId: defaultCurrency.Id,
              });
            }
          })
        )
    );
  }

  getBanksInLine(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/ExtraAndPOS_Bank/banksInMainBranch`).pipe(
        tap((res) => {
          if (res?.IsSuccess) {
            this.banksInLine = res.Obj;
          }
        })
      )
    );
  }

  getSuppliers(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_Client/GetAllSupplierForDropDown`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.suppliers = res?.Obj?.Result;
            }
          })
        )
    );
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
      equivalentPrice: [equivalentPrice],
      docNoManual: [docNoManual],
      isMobile: [isMobile],
      mainBank: [mainBank],
      treasuryTransactionDetails: this.fb.array([this.newLine()]),
    });
  }

  get linesArray(): FormArray {
    return this.receiptVoucherForm.get(
      'treasuryTransactionDetails'
    ) as FormArray;
  }

  addNewLine(value?: any) {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  removeLine(i: number) {
    if (this.linesArray?.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  newLine(value?: any) {
    let accTreeId;
    let clientId;
    let clientName;
    let saleInvoiceId;
    let amount;
    let supplierId;
    let treasuryId;
    let costCenterId;
    let bankId;
    let treasuryName;
    let bankName;
    let notes;

    return this.fb.group({
      clientId: [clientId],
      clientName: [clientName],
      saleInvoiceId: [saleInvoiceId],
      notes: [notes],
      amount: [amount],
      costCenterId: [costCenterId],
      accTreeId: [accTreeId],
      bankId: [bankId],
      bankName: [bankName],
      treasuryId: [treasuryId],
      treasuryName: [treasuryName],
      supplierId: [supplierId],
    });
  }

  selectClientInLine(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ clientName: ev.NameAr });
      this.getInvoicesByClientId(ev.Id);
    }
  }

  getInvoicesByClientId(id: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_SaleInvoice/GetInvoicesByClientIs?id=${id}`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.clientInvoices = res.Obj;
            }
          })
        )
    );
  }

  getTreasuriesInLine(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/Treasury/GetAllTreasuryMainBranch`).pipe(
        tap((res) => {
          this.treasuriesInLine = res;
        })
      )
    );
  }

  selectTreasuryType(ev: any) {
    let commonDefaultSelected = this.defaultSelected.slice(
      this.defaultSelected.length - 3
    );
    if (ev.value === 1) {
      this.defaultSelected = [
        { field: 'accounts', header: 'accounts' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 2) {
      this.defaultSelected = [
        { field: 'clients', header: 'clients' },
        { field: 'invoices', header: 'invoices' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 3) {
      this.defaultSelected = [
        { field: 'banks', header: 'banks' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 4) {
      this.defaultSelected = [
        { field: 'safe', header: 'safe' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 5) {
      this.defaultSelected = [
        { field: 'suppliers', header: 'suppliers' },
        { field: 'invoices', header: 'invoices' },
        ...commonDefaultSelected,
      ];
    }
    this._selectedColumns = this.defaultSelected;
    this.linesArray.controls.forEach((form) => {
      if (ev.value === 1) {
        form.patchValue({
          clientId: null,
          clientName: null,
          saleInvoiceId: null,
          bankId: null,
          bankName: null,
          treasuryId: null,
          supplierId: null,
          treasuryName: null,
        });
      }
      if (ev.value === 2) {
        form.patchValue({
          accTreeId: null,
          bankId: null,
          bankName: null,
          treasuryId: null,
          supplierId: null,
          treasuryName: null,
        });
      }
      if (ev.value === 3) {
        form.patchValue({
          accTreeId: null,
          clientId: null,
          clientName: null,
          saleInvoiceId: null,
          supplierId: null,
          treasuryId: null,
          treasuryName: null,
        });
      }
      if (ev.value === 4) {
        form.patchValue({
          accTreeId: null,
          clientId: null,
          clientName: null,
          saleInvoiceId: null,
          supplierId: null,
          bankId: null,
          bankName: null,
        });
      }
      if (ev.value === 5) {
        form.patchValue({
          accTreeId: null,
          clientId: null,
          clientName: null,
          bankId: null,
          bankName: null,
          treasuryId: null,
          treasuryName: null,
        });
      }
    });
  }

  selectBankInLine(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ bankName: ev.NameAr });
    }
  }

  selectSupplier(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      this.getInvoicesBySupplierId(ev.SupplierId);
    }
  }

  selectTreasuryInLine(ev: any, i: number) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ treasuryName: ev.NameAr });
    }
  }

  getInvoicesBySupplierId(id: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_BuyInvoice/GetInvoicesBySuppliers?id=${id}`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.supplierInvoices = res?.Obj;
            }
          })
        )
    );
  }

  getEmployeeTreasury(): void {
    let employeeId =
      this.helpers.getItemFromLocalStorage(USER_PROFILE)?.EmployeeId;
    firstValueFrom(
      this.dataService
        .get(
          `${apiUrl}/ExtraAndPOS_Employee/GetEmployeeTreasury?id=${employeeId}`
        )
        .pipe(
          tap((res) => {
            this.receiptVoucherForm.patchValue({ treasuryId: res });
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

  submit(): void {
    this.spinner.show();
    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPos_TreasuryManagement/CreateTreasury`,
          this.receiptVoucherForm.value
        )
        .pipe(
          tap((res) => {
            if (res.IsSuccess) {
              console.log(res);

              this.spinner.hide();
              this.toast.show(Toast.added, { classname: Toast.success });
              console.log(res);
            }
          })
        )
    );
  }
}
