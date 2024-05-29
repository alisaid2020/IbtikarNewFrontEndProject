import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
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
  clientInvoices: any[];
  employeeTreasury: any;
  allColumns: any[] = [];
  clientsData: any[] = [];
  treasuriesInLine: any[];
  supplierInvoices: any[];
  subs: Subscription[] = [];
  E_USER_ROLE = E_USER_ROLE;
  USER_PROFILE = USER_PROFILE;
  _selectedColumns: any[] = [];
  receiptVoucherForm: FormGroup;
  accTreeAccountsData: any[] = [];
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

  fb = inject(FormBuilder);
  dataService = inject(DataService);
  spinner = inject(NgxSpinnerService);
  toast = inject(ToastService);
  translate = inject(TranslateService);
  tableService = inject(TableService);
  helpers = inject(HelpersService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.receiptVoucher),
        tap((res) => {
          if (res?.IsSuccess) {
            this.receiptVoucher = res.Obj.Treasury;
            this.initForm();
            this.changeTreasuryType({
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
    this.getEmployeeTreasury();
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
        .get(`${apiUrl}/XtraAndPos_TreasuryManagement/TreasuryTransactionInit`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.treasuries = res.Obj.treasuries;
              this.banks = res.Obj.Banks;
              this.costCenters = res.Obj.CostCenters;
              this.banksInLine = res.Obj.BankInMainBranch;
              this.treasuriesInLine = res.Obj.TreasuryInMainBranch;
              this.suppliers = res.Obj.Suppliers;
              this.currencies = res.Obj.Currencyies;
              if (!this.receiptVoucher) {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.IsDefault == true
                );
                this.receiptVoucherForm.patchValue({
                  curencyId: this.defaultCurrency.Id,
                  docNo: res.Obj.docNo,
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
    this.allColumns = this.tableService.tableColumns(this.invoiceLineKeys);
    [this.changedColumns, this._selectedColumns] =
      await this.tableService.storageFn(
        this.defaultSelected,
        this.defaultStorage,
        this._selectedColumns
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
      equivalentPrice: [equivalentPrice],
      docNoManual: [docNoManual],
      isMobile: [isMobile],
      mainBank: [mainBank],
      treasuryTransactionDetails: this.fb.array([this.newLine()]),
    });
  }

  fillLinesFromApi(): void {
    if (this.receiptVoucher?.TreasuryTransactionsDetails?.length) {
      this.linesArray.clear();
      this.receiptVoucher?.TreasuryTransactionsDetails.forEach(
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
            this.getInvoicesByClientId(line.ClientId);
            this.clientsData[i] = [
              {
                Id: line.ClientId,
                NameAr: line.ClientName,
                NameEn: line.ClientName,
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
      clientName = value.ClientName;
      saleInvoiceId = value.SaleInvoiceId ? { Id: value.SaleInvoiceId } : null;
      amount = value.Amount;
      supplierId = value.SupplierId || null;
      treasuryId = value.TreasuryId || null;
      costCenterId = value.CostCenterId || null;
      bankId = value.BankId || null;
      treasuryName = value.TreasuryName;
      bankName = value.BankName;
      notes = value.Notes;
    }

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

  changeTreasuryType(ev: any) {
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
            this.employeeTreasury = res;
            if (!this.receiptVoucher) {
              this.receiptVoucherForm.patchValue({ treasuryId: res });
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
      this.defaultCurrency = ev;
    }
  }

  submit(): void {
    this.spinner.show();
    if (this.receiptVoucher) {
      firstValueFrom(
        this.dataService
          .put(
            `${apiUrl}/XtraAndPos_TreasuryManagement/updateTreasury`,
            this.receiptVoucherForm.value
          )
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
      return;
    }
    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPos_TreasuryManagement/CreateTreasury`,
          this.receiptVoucherForm.value
        )
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
