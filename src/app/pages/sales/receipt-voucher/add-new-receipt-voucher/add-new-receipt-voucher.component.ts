import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
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
  tableStorage = 'receipt-voucher-form-table';
  defaultStorage = 'receipt-voucher-form-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  accountsApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetAccountsByTrim`;
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
  defaultSelected = [
    { field: 'clientId', header: 'clientId' },
    { field: 'SaleInvoiceId', header: 'SaleInvoiceId' },
    { field: 'Amount', header: 'Amount' },
    { field: 'costCenterId', header: 'costCenterId' },
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

  async ngOnInit() {
    this.getTreasuries();
    this.getBanks();
    this.getCostCenters();
    this.getCurrencies();
    this.getBanksInLine();
    this.getTreasuriesInLine();
    this.getSuppliers();
    this.initForm();
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
    let docDate = new Date();
    let nameAr = 'سند قبض';
    let notes;
    let treasuryType = 2;
    let treasuryId;
    let equivalentPrice = 0;
    let typeofpayment;
    let ccenter;
    let docNoManual;
    let isMobile = false;
    let exchangeRate = 1;
    let currencyId;
    let mainBank;
    // let docNo : not in the code but in swagger what its value
    // let currencyId : not in the swagger but in the view ,will add to api or not

    this.receiptVoucherForm = this.fb.group({
      id: [id],
      nameAr: [nameAr],
      docDate: [docDate],
      typeofpayment: [typeofpayment],
      treasuryId: [treasuryId],
      treasuryType: [treasuryType],
      ccenter: [ccenter],
      currencyId: [currencyId],
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
        .get(`${apiUrl}/ExtraAndPOS_SaleInvoice/GetInvoicesByClientIs`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.clientInvoices = res.Obj;
              this.clientInvoices = this.clientInvoices.filter(
                (res) => res.ClientId == id
              );
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
        { field: 'AccTreeId', header: 'AccTreeId' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 2) {
      this.defaultSelected = [
        { field: 'clientId', header: 'clientId' },
        { field: 'SaleInvoiceId', header: 'SaleInvoiceId' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 3) {
      this.defaultSelected = [
        { field: 'BankId', header: 'BankId' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 4) {
      this.defaultSelected = [
        { field: 'TreasuryId', header: 'TreasuryId' },
        ...commonDefaultSelected,
      ];
    }
    if (ev.value === 5) {
      this.defaultSelected = [
        { field: 'SupplierId', header: 'SupplierId' },
        { field: 'SaleInvoiceId', header: 'SaleInvoiceId' },
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
        .get(`${apiUrl}/ExtraAndPOS_BuyInvoice/GetInvoicesBySuppliers`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.supplierInvoices = res?.Obj;
              this.supplierInvoices = this.supplierInvoices.filter(
                (res) => res.SupplierId == id
              );
            }
          })
        )
    );
  }
}
