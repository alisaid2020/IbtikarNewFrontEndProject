import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { E_USER_ROLE } from '@constants/general.constant';
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
  salesInvoiceForm: FormGroup;
  salesInvoiceLoading: boolean;
  salesReturnFound: any;
  salesInvoices: any[] = [];
  changedColumns: any;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  allColumns: any[] = [];
  items: any[] = [];
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
  selectClients: any[] = [];
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
  ];
  visaTrxTypes = [
    { name: 'Mada', value: 1 },
    { name: 'Transfer', value: 2 },
  ];
  userRole = E_USER_ROLE;

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
    let clientId;
    let saleInvoiceId;
    let docDate = new Date();
    let paymentType;
    let notes;
    let saleInvoiceReturnDetails = this.fb.array([]);
    // let cash;
    // let visa;
    // let bankId;
    // let debt;
    // let isPendingPayment;
    // let treasuryId;
    // let exchangePrice;
    // let clientType;
    // let docType;
    // let storeId;
    // let isMobile;
    // let visaTrxType;
    // let visaTrxNo;
    // let totalDisc = 0;
    // let totalVat = 0;
    // let totalNet = 0;

    this.salesInvoiceForm = this.fb.group({
      clientId: [clientId],
      saleInvoiceId: [saleInvoiceId],
      docDate: [docDate],
      paymentType: [paymentType],
      notes: [notes],
      // totalDisc: [totalDisc],
      // cash: [cash],
      // visa: [visa],
      // bankId: [bankId],
      // debt: [debt],
      // isPendingPayment: [isPendingPayment],
      // treasuryId: [treasuryId],
      // exchangePrice: [exchangePrice],
      // clientType: [clientType],
      // docType: [docType],
      // storeId: [storeId],
      // isMobile: [isMobile],
      // visaTrxType: [visaTrxType],
      // visaTrxNo: [visaTrxNo],
      saleInvoiceReturnDetails: saleInvoiceReturnDetails,
      // totalVat: [totalVat],
      // totalNet: [totalNet],
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
  filterSaleOrders(ev: any) {}

  removeSaleOrder(ev: any) {}

  onChangeSource(ev: any) {}

  get linesArray(): FormArray {
    return this.salesInvoiceForm.get('saleInvoiceReturnDetails') as FormArray;
  }

  searchInSaleInvoices(ev: any) {
    if (ev.term?.length >= 1) {
      this.salesInvoiceLoading = true;
      let params = { data: ev.term };
      firstValueFrom(
        this.dataService
          .get(`${apiUrl}/ExtraAndPOS_ReturnSaleInvoice/GetByNo`, { params })
          .pipe(
            tap((res) => {
              this.salesInvoiceLoading = false;
              this.extractInvoiceLines(res.Obj.invoice.SaleInvoiceDetails);
              this.salesReturnFound = res.Obj.invoice;
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
            })
          )
      );
    }
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

  extractInvoiceLines(saleInvoiceDetails: any[]) {
    if (this.linesArray.value?.length > 0) {
      this.linesArray.clear();
    }
    saleInvoiceDetails.forEach((line, i: number) => {
      this.addNewLine(line);
      this.items[i] = [
        { ItemId: line.ItemID, NameAr: line.NameAr, NameEn: line.NameEn },
      ];
    });
  }
}
