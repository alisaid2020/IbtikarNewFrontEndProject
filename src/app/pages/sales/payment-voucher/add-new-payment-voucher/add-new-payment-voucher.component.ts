import { Component, OnInit, inject } from '@angular/core';
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
  treasuriesInLine: any[];
  clientsData: any[] = [];
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
    { field: 'accounts', header: 'accounts' },
    { field: 'Amount', header: 'amount' },
    { field: 'costCenterId', header: 'costCenter' },
    { field: 'Notes', header: 'notes' },
    { field: 'IsVatchecked', header: 'includeVat' },
    { field: 'vatVal', header: 'vatValue' },
    { field: 'IsVatcheckedNotes', header: 'vatNotes' },
  ];
  invoiceLineKeys = [
    'AccTreeId',
    'clientId',
    'BuyInvoiceId',
    'Amount',
    'Notes',
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

  async ngOnInit() {
    firstValueFrom(
      this.route.data.pipe(
        map((res) => res.paymentVoucher),
        tap((res) => {
          if (res?.IsSuccess) {
            this.paymentVoucher = res.Obj.TreasuryOut;
            this.initForm();
            this.changeTreasuryType({
              value: this.paymentVoucher.TreasuryType,
            });
            this.fillLinesFromApi();
            return;
          }
          this.initForm();
        })
      )
    );
    this.getMainBanks();
    this.getMainTreasuries();
    this.getCostCenters();
    this.getCurrencies();
    this.getBanksInLine();
    this.getSuppliers();
    this.getTreasuryInLine();
    this.getEmployeeTreasury();
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
          }
        }
      );
    }
  }

  getCurrencies(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPOS_HREmployee/GetCurrencyForDropDown`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.currencies = res.Obj.Currencies;
              if (!this.paymentVoucher) {
                this.defaultCurrency = this.currencies.find(
                  (el) => el.IsDefault == true
                );
                this.paymentVoucherForm.patchValue({
                  curencyId: this.defaultCurrency.Id,
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

  changeCurrency(ev: any): void {
    if (ev) {
      if (ev.IsDefault) {
        this.paymentVoucherForm.patchValue({ exchangeRate: 1 });
      }
      this.defaultCurrency = ev;
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

  getMainTreasuries(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/Treasury/GetAllForDropDown`).pipe(
        tap((res) => {
          this.treasuries = res;
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
            this.paymentVoucherForm.patchValue({ treasuryId: res });
          })
        )
    );
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
    let clientId;
    let clientName;
    let amount = 0;
    let notes;
    let bankId;
    let bankName;
    let supplierId;
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
      clientName = value.ClientName;
      amount = value.Amount;
      notes = value.Notes;
      bankId = value.BankId || null;
      bankName = value.BankName;
      supplierId = value.SupplierId || null;
      treasuryId = value.TreasuryId || null;
      treasuryName = value.TreasuryName;
      costCenterId = value.CostCenterId || null;
      buyInvoiceId = value.BuyInvoiceId ? value.BuyInvoiceId : null;
      isVatchecked = value.IsVatchecked;
      vatVal = value.vatVal;
      taxNotes = value.IsVatcheckedNotes;
    }

    return this.fb.group({
      clientId: [clientId],
      clientName: [clientName],
      buyInvoiceId: [buyInvoiceId],
      notes: [notes],
      amount: [amount],
      costCenterId: [costCenterId],
      accTreeId: [accTreeId],
      bankId: [bankId],
      bankName: [bankName],
      treasuryId: [treasuryId],
      treasuryName: [treasuryName],
      supplierId: [supplierId],
      isVatchecked: [isVatchecked],
      vatVal: [vatVal],
      taxNotes: [taxNotes],
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

  changeTreasuryType(ev: any): void {
    let commonDefaultSelected = this.defaultSelected.slice(
      this.defaultSelected.length - 6
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
    this.linesArray.controls.forEach((form, i: any) => {
      if (ev.value === 1) {
        form.patchValue({
          clientId: null,
          clientName: null,
          buyInvoiceId: null,
          bankId: null,
          bankName: null,
          treasuryId: null,
          supplierId: null,
          treasuryName: null,
        });
        this.clientsData[i] = [];
        this.clientInvoices[i] = [];
        this.supplierInvoices[i] = [];
      }
      if (ev.value === 2) {
        form.patchValue({
          accTreeId: null,
          bankId: null,
          bankName: null,
          treasuryId: null,
          supplierId: null,
          buyInvoiceId: null,
          treasuryName: null,
        });
        this.accTreeAccountsData[i] = [];
        this.supplierInvoices[i] = [];
      }
      if (ev.value === 3) {
        form.patchValue({
          accTreeId: null,
          clientId: null,
          clientName: null,
          buyInvoiceId: null,
          supplierId: null,
          treasuryId: null,
          treasuryName: null,
        });
        this.clientsData[i] = [];
        this.accTreeAccountsData[i] = [];
        this.clientInvoices[i] = [];
        this.supplierInvoices[i] = [];
      }
      if (ev.value === 4) {
        form.patchValue({
          accTreeId: null,
          clientId: null,
          clientName: null,
          buyInvoiceId: null,
          supplierId: null,
          bankId: null,
          bankName: null,
        });
        this.clientsData[i] = [];
        this.accTreeAccountsData[i] = [];
        this.clientInvoices[i] = [];
        this.supplierInvoices[i] = [];
      }
      if (ev.value === 5) {
        form.patchValue({
          accTreeId: null,
          clientId: null,
          clientName: null,
          buyInvoiceId: null,
          bankId: null,
          bankName: null,
          treasuryId: null,
          treasuryName: null,
        });
        this.clientsData[i] = [];
        this.accTreeAccountsData[i] = [];
        this.clientInvoices[i] = [];
      }
    });
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

  getMainBanks(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/ExtraAndPOS_Bank/ManagementInfo`).pipe(
        tap((res) => {
          if (res.IsSuccess) {
            this.banks = res.Obj.list;
          }
        })
      )
    );
  }

  selectClientInLine(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ clientName: ev.NameAr });
      this.getInvoicesByClientId(ev.Id, i);
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

  getBanksInLine(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/ExtraAndPOS_Bank/banksInMainBranch`).pipe(
        tap((res) => {
          if (res?.IsSuccess) {
            this.banksInLine = res?.Obj;
          }
        })
      )
    );
  }

  selectBankInLine(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ bankName: ev.NameAr });
    }
  }

  getTreasuryInLine(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/Treasury/GetAllTreasuryMainBranch`).pipe(
        tap((res) => {
          this.treasuriesInLine = res;
        })
      )
    );
  }

  selectTreasuryInLine(ev: any, i: number) {
    let form = this.linesArray.controls[i];
    if (ev) {
      form.patchValue({ treasuryName: ev.NameAr });
    }
  }

  getSuppliers(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_Client/GetAllSupplierForDropDown`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.suppliers = res.Obj.Result;
            }
          })
        )
    );
  }

  selectSupplier(ev: any, i: any): void {
    if (ev) {
      this.getInvoicesBySupplierId(ev.SupplierId, i);
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
