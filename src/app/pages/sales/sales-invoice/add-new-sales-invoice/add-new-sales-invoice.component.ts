import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit {
  salesInvoiceForm: FormGroup;
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  allColumns: any[] = [];
  defaultStorage = 'general-default-selected';
  tableStorage = 'general-table';
  changedColumns: any;
  defaultSelected: any[] = [
    { field: 'branch', header: 'branch' },
    { field: 'category', header: 'category' },
    { field: 'price', header: 'price' },
  ];
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
  ];
  invoiceLineKeys = [
    'price',
    'discount',
    'vat',
    'itemID',
    'quantity',
    'itemType_Sale',
    'uniteId',
  ];
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }

  helpers = inject(HelpersService);
  translate = inject(TranslateService);
  tableService = inject(TableService);
  fb = inject(FormBuilder);

  async ngOnInit() {
    this.initForm();
    // await this.initTableColumns();
    // this.subs.push(
    //   this.translate.onLangChange.subscribe(async () => {
    //     await this.initTableColumns();
    //   })
    // );
  }

  initForm() {
    let clientId;
    let paymentType;
    let docDate;
    let notes;
    let saleInvoiceDetails = this.fb.array([]);

    this.salesInvoiceForm = this.fb.group({
      clientId: [clientId],
      paymentType: [paymentType],
      docDate: [docDate],
      notes: [notes],
      saleInvoiceDetails: saleInvoiceDetails,
    });
  }

  get linesArray(): FormArray {
    return this.salesInvoiceForm.get('saleInvoiceDetails') as FormArray;
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }
  remove(i: number) {}

  newLine(value?: any): FormGroup {
    let barcode;
    let itemID;
    if (value) {
      barcode = value.barcode;
      itemID = value.itemID;
    }
    return this.fb.group({
      barcode: [barcode],
      itemID: [itemID],
    });
  }

  async initTableColumns() {
    this.allColumns = this.tableService.tableColumns(this.invoiceLineKeys[0]);
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

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
