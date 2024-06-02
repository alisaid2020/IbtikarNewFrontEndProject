import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { E_USER_ROLE, USER_PROFILE } from '@constants/general.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { Subscription, firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-payment-voucher',
  templateUrl: './add-new-payment-voucher.component.html',
})
export class AddNewPaymentVoucherComponent implements OnInit {
  banks: any[];
  defaultCurrency: any;
  treasuries: any[];
  treasuriesInLine: any[];
  costCenters: any[];
  accTreeAccountsData: any[] = [];
  currencies: any[];
  allColumns: any[] = [];
  supplierInvoices: any[] = [];
  paymentVoucher: any;
  employeeTreasury: any;
  changedColumns: any;
  suppliers: any[];
  clientsData: any[] = [];
  clientInvoices: any[] = [];
  E_USER_ROLE = E_USER_ROLE;
  USER_PROFILE = USER_PROFILE;
  paymentVoucherForm: FormGroup;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  banksInLine: any[];
  tableStorage = 'payment-voucher-form-table';
  defaultStorage = 'payment-voucher-form-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  accountsApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetAccountExpensessByTrim`;
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
    { field: 'BuyInvoiceId', header: 'invoices' },
    { field: 'Amount', header: 'amount' },
    { field: 'costCenterId', header: 'costCenter' },
    { field: 'Notes', header: 'notes' },
    { field: 'IsVatchecked', header: 'includeTax' },
    { field: 'vatVal', header: 'taxValue' },
    { field: 'IsVatcheckedNotes', header: 'taxNotes' },
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

  async ngOnInit() {
    this.initForm();
    this.getMainBanks();
    this.getMainTreasuries();
    this.getCostCenters();
    this.getCurrencies();
    this.getBanksInLine();
    this.getSuppliers();
    this.getTreasuryInLine();
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
    let treasuryType;
    let typeofpayment;
    let mainBank;
    let docNoManual;
    let docNo;
    let totalAmount = 0;
    let totalVat = 0;
    let totalAfterVat = 0;
    // not found in swagger api
    let curencyId;
    let exchangeRate;

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
      buyInvoiceId = value.BuyInvoiceId ? value.BuyInvoiceId : null;
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

  removeLine(i: number) {
    if (this.linesArray?.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  changeTreasuryType(ev: any) {
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
      this.getInvoicesBySupplierId(ev.Id, i);
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
    this.paymentVoucherForm.patchValue({
      equivalentPrice,
      totalAmount: equivalentPrice,
      totalAfterVat: equivalentPrice,
    });
  }

  changeVat(ev: any, i: number) {
    console.log(ev.target.checked);
    console.log(this.paymentVoucherForm.value);
  }
}
