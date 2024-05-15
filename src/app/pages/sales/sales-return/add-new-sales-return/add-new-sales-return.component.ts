import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { E_USER_ROLE } from '@constants/general.constant';
import { Toast } from '@enums/toast.enum';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-sales-return',
  templateUrl: './add-new-sales-return.component.html',
})
export class AddNewSalesReturnComponent implements OnInit {
  items: any[] = [];
  changedColumns: any;
  salesReturnFound: any;
  allColumns: any[] = [];
  userRole = E_USER_ROLE;
  salesInvoices: any[] = [];
  subs: Subscription[] = [];
  selectClients: any[] = [];
  salesInvoiceForm: FormGroup;
  _selectedColumns: any[] = [];
  salesInvoiceLoading: boolean;
  invoiceNumber = new FormControl();
  tableStorage = 'salesReturnLines-table';
  defaultStorage = 'salesReturnLines-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  invoiceLineKeys = [
    'Price',
    'Barcode',
    'Item',
    'Unit',
    'Quantity',
    'Balance',
    'Vat',
    'Discount',
    'Total',
  ];
  defaultSelected: any[] = [
    { field: 'Barcode', header: 'Barcode' },
    { field: 'itemID', header: 'itemID' },
    { field: 'correctQty', header: 'correctQty' },
    { field: 'returnedQty', header: 'returnedQty' },
    { field: 'quantity', header: 'quantity' },
    { field: 'price', header: 'price' },
    { field: 'vat', header: 'vat' },
    { field: 'discount', header: 'discount' },
  ];
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
  ];
  visaTrxTypes = [
    { name: 'Mada', value: 1 },
    { name: 'Transfer', value: 2 },
  ];

  router = inject(Router);
  fb = inject(FormBuilder);
  toast = inject(ToastService);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  spinner = inject(NgxSpinnerService);
  translate = inject(TranslateService);

  async ngOnInit() {
    this.initForm();
    await this.initTableColumns();
    this.subs.push(
      this.translate.onLangChange.subscribe(async () => {
        await this.initTableColumns();
      })
    );
  }

  initForm(): void {
    let cash;
    let debt;
    let clientId;
    let notes;
    let saleInvoiceId;
    let docDate = new Date();
    let isPendingPayment;
    let saleInvoiceNo;
    let treasuryId;
    let exchangePrice;
    let clientType;
    let docType;
    let paymentType;
    let storeId;
    let totalDisc;
    let totalNet;
    let totalVat;
    let saleInvoiceReturnDetails = this.fb.array([]);

    this.salesInvoiceForm = this.fb.group({
      clientId: [clientId],
      saleInvoiceId: [saleInvoiceId],
      docDate: [docDate],
      paymentType: [paymentType],
      notes: [notes],
      totalDisc: [totalDisc],
      cash: [cash],
      debt: [debt],
      isPendingPayment: [isPendingPayment],
      treasuryId: [treasuryId],
      exchangePrice: [exchangePrice],
      clientType: [clientType],
      docType: [docType],
      storeId: [storeId],
      saleInvoiceNo: [saleInvoiceNo],
      saleInvoiceReturnDetails: saleInvoiceReturnDetails,
      totalNet: [totalNet],
      totalVat: [totalVat],
    });
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

  get linesArray(): FormArray {
    return this.salesInvoiceForm.get('saleInvoiceReturnDetails') as FormArray;
  }

  searchInvoiceNumber(): void {
    this.spinner.show();
    let params = { data: +this.invoiceNumber.value };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_ReturnSaleInvoice/GetByNo`, { params })
        .pipe(
          tap((res) => {
            this.spinner.hide();
            if (res?.Obj) {
              this.salesReturnFound = res.Obj.invoice;
              this.extractInvoiceLines();
            } else {
              this.toast.show('NoInvoiceMatchThatNumber', {
                classname: Toast.error,
              });
            }
          })
        )
    );
  }

  newLine(value?: any): FormGroup {
    let itemID;
    let uniteId;
    let productId;
    let vat = 0;
    let quantity = 0;
    let balance = 0;
    let price = 0;
    let discount = 0;
    let total = 0;
    let returnedQty = 0;
    let saleInvoiceDetailId;
    let correctQty = 0;
    if (value) {
      itemID = value.ItemID;
      returnedQty = value.ReturnedQty;
      discount = value.Discount;
      vat = value.Vat;
      price = value.Price;
      saleInvoiceDetailId = value.Id;
      uniteId = value.UniteId;
      productId = value.ProductId;
      correctQty = value.Quantity;
    }
    return this.fb.group({
      itemID: [itemID],
      uniteId: [uniteId],
      returnedQty: [returnedQty],
      saleInvoiceDetailId: [saleInvoiceDetailId],
      vat: [vat],
      productId: [productId],
      quantity: [quantity],
      correctQty: [correctQty],
      balance: [balance],
      price: [price],
      discount: [discount],
      total: [total],
    });
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  remove(i: number) {
    if (this.linesArray.length > 1) {
      this.linesArray.removeAt(i);
    }
  }

  extractInvoiceLines() {
    this.salesInvoiceForm.patchValue({
      clientId: this.salesReturnFound.ClientId,
      paymentType: this.salesReturnFound.PaymentType,
      notes: this.salesReturnFound.Notes,
    });
    this.selectClients = [
      {
        Id: this.salesReturnFound.ClientId,
        clientName: this.salesReturnFound.ClientName,
      },
    ];
    if (this.linesArray.value?.length > 0) {
      this.linesArray.clear();
    }
    this.salesReturnFound.SaleInvoiceDetails.forEach((line: any, i: number) => {
      this.addNewLine(line);
      this.items[i] = [
        { ItemId: line.ItemID, NameAr: line.NameAr, NameEn: line.NameEn },
      ];
    });
  }
}
