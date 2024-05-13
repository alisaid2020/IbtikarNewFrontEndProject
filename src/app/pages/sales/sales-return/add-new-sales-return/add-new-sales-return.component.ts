import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-new-sales-return',
  templateUrl: './add-new-sales-return.component.html',
})
export class AddNewSalesReturnComponent implements OnInit {
  salesInvoiceForm: FormGroup;
  changedColumns: any;
  subs: Subscription[] = [];
  _selectedColumns: any[] = [];
  allColumns: any[] = [];
  tableStorage = 'salesReturnLines-table';
  defaultStorage = 'salesReturnLines-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  InvoiceApi = `${apiUrl}/ExtraAndPOS_ReturnSaleInvoice/GetByNo`;
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
    { field: 'Item', header: 'Item' },
    { field: 'CorrectQty', header: 'CorrectQty' },
    { field: 'ReturnedQty', header: 'ReturnedQty' },
    { field: 'Quantity', header: 'Quantity' },
    { field: 'Price', header: 'Price' },
    { field: 'Vat', header: 'Vat' },
    { field: 'Discount', header: 'Discount' },
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
    let clientId;
    let saleInvoiceId;
    // let paymentType;
    // let docDate = new Date();
    // let notes;
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
      // paymentType: [paymentType],
      // docDate: [docDate],
      // notes: [notes],
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
      // saleInvoiceDetails: this.fb.array([this.newLine()]),
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
}
