import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    { field: 'Item', header: 'Item' },
    { field: 'CorrectQty', header: 'CorrectQty' },
    { field: 'ReturnedQty', header: 'ReturnedQty' },
    { field: 'Quantity', header: 'Quantity' },
    { field: 'Price', header: 'Price' },
    { field: 'Vat', header: 'Vat' },
    { field: 'Discount', header: 'Discount' },
  ];
  selectClients: any[] = [];
  paymentTypes: any = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
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
      docDate: [docDate],
      paymentType: [paymentType],
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
  filterSaleOrders(ev: any) {}

  removeSaleOrder(ev: any) {}

  onChangeSource(ev: any) {}

  searchInSaleInvoices(ev: any) {
    this.salesInvoiceLoading = true;
    let params = { data: +ev.term };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_ReturnSaleInvoice/GetByNo`, { params })
        .pipe(
          tap((res) => {
            this.salesInvoiceLoading = false;
            this.salesReturnFound = res.Obj.invoice;

            console.log(this.salesReturnFound);

            this.salesInvoiceForm.patchValue({
              clientId: this.salesReturnFound.ClientId,
              paymentType: this.salesReturnFound.PaymentType,
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
