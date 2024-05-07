import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { TableService } from '@services/table.service';
import { Subscription, firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit, OnDestroy {
  salesInvoiceForm: FormGroup;
  _selectedColumns: any[] = [];
  subs: Subscription[] = [];
  allColumns: any[] = [];
  itemsUnits: any = [];
  barcodeItems: any = [];
  items: any = [];
  barcodeControls = [new FormControl()];
  changedColumns: any;
  salesInvoiceInitObj: any;
  defaultStorage = 'salesInvoiceLines-default-selected';
  tableStorage = 'salesInvoiceLines-table';
  itemsByBarcodeApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemByBarcode`;
  itemsByTermApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemsByTrim`;
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  defaultSelected: any[] = [
    { field: 'Barcode', header: 'Barcode' },
    { field: 'itemID', header: 'itemID' },
    { field: 'uniteId', header: 'uniteId' },
    { field: 'quantity', header: 'quantity' },
    { field: 'balance', header: 'balance' },
    { field: 'price', header: 'price' },
    { field: 'vat', header: 'vat' },
    { field: 'discount', header: 'discount' },
    { field: 'total', header: 'total' },
  ];
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
  ];
  visaTrxTypes = [
    { name: 'Mada', value: 1 },
    { name: 'Transfer', value: 2 },
  ];
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
  set selectedColumns(val: any[]) {
    this._selectedColumns = this.defaultSelected.filter((col: any) =>
      val.includes(col)
    );
  }
  helpers = inject(HelpersService);
  translate = inject(TranslateService);
  tableService = inject(TableService);
  dataService = inject(DataService);
  fb = inject(FormBuilder);

  async ngOnInit() {
    this.salesInvoiceInit();
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
    let paymentType;
    let docDate;
    let notes;
    let cash;
    let visa;
    let bankId;
    let debt;
    let isPendingPayment;
    let treasuryId;
    let exchangePrice;
    let clientType;
    let docType;
    let storeId;
    let isMobile;
    let visaTrxType;
    let visaTrxNo;
    let totalDisc;
    let totalVat;
    let totalNet;

    this.salesInvoiceForm = this.fb.group({
      clientId: [clientId],
      paymentType: [paymentType],
      docDate: [docDate],
      notes: [notes],
      totalDisc: [totalDisc],
      cash: [cash],
      visa: [visa],
      bankId: [bankId],
      debt: [debt],
      isPendingPayment: [isPendingPayment],
      treasuryId: [treasuryId],
      exchangePrice: [exchangePrice],
      clientType: [clientType],
      docType: [docType],
      storeId: [storeId],
      isMobile: [isMobile],
      visaTrxType: [visaTrxType],
      visaTrxNo: [visaTrxNo],
      saleInvoiceDetails: this.fb.array([this.newLine()]),
      totalVat: [totalVat],
      totalNet: [totalNet],
    });
  }

  get linesArray(): FormArray {
    return this.salesInvoiceForm.get('saleInvoiceDetails') as FormArray;
  }

  addNewLine(value?: any): void {
    this.barcodeControls.push(new FormControl());
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  remove(i: number) {
    if (this.linesArray.length > 1) {
      this.linesArray.removeAt(i);
      this.barcodeControls.splice(i, 1);
    }
  }

  newLine(value?: any): FormGroup {
    let itemID;
    let uniteId;
    let productId;
    let vat = 0;
    let quantity = 1;
    let balance = 0;
    let price = 0;
    let discount = 0;
    return this.fb.group({
      itemID: [itemID],
      uniteId: [uniteId],
      vat: [vat],
      productId: [productId],
      quantity: [quantity],
      balance: [balance],
      price: [price],
      discount: [discount],
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

  salesInvoiceInit(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/SalesInvoiceInit`)
        .pipe(
          tap((res) => {
            this.salesInvoiceInitObj = res.Obj;
          })
        )
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

  selectedItemByBarcode(ev: any, index: number) {
    if (ev) {
      this.itemsUnits[index] = [{ unitId: ev.UnitId, name: ev.UnitName }];
      this.items[index] = [{ ...ev, NameAr: ev.Item.NameAr }];
      this.linesArray.controls[index].patchValue({
        itemID: ev.ItemId,
        uniteId: ev.UnitId,
        vat: ev.Vat,
        productId: ev.Id,
      });
      this.addNewLine();
      this.getBalance(ev, index);
      this.getPrice(ev, index);
    }
  }

  selectedItemByName(ev: any, index: number) {
    if (ev) {
      ev.ItemUnits.forEach((el: any) => {
        el.name = el.UnitName;
        el.unitId = el.UnitId;
      });
      this.itemsUnits[index] = ev.ItemUnits;
    }
  }

  selectedUnit(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    const itemID = form.get('itemID')?.value;
    const unitId = form.get('uniteId')?.value;
    this.barcodeControls[i].setValue(ev?.Barcode);
    this.barcodeItems[i] = [ev];
    form.patchValue({ vat: ev?.Vat, productId: ev.Id });
    this.getBalance(ev, i);
    this.getPrice(ev, i);
  }

  getBalance(ev: any, i: number): void {
    let params = {
      itemUnitId: ev.Id,
      storeId: this.salesInvoiceInitObj.empStore,
    };
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/GetItemBalanceFromStorage`, {
          params,
        })
        .pipe(
          tap((res) => {
            this.linesArray.controls[i].patchValue({ balance: res.Obj });
          })
        )
    );
  }

  getPrice(ev: any, i: number): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/ItemPriceList`, {
          params: { barcode: ev.Barcode },
        })
        .pipe(
          tap((res) => {
            this.linesArray.controls[i].patchValue({ price: res.Obj.price });
            this.getDiscount(res.Obj, i);
          })
        )
    );
  }

  getDiscount(ev: any, i: number) {
    let form = this.linesArray.controls[i];
    let quantity = form.get('quantity')?.value;
    let price = form.get('price')?.value;
    // let discount = form.get('discount')?.value;

    if (ev.offers.ItemDiscount > 0 && quantity === ev.offers.ItemQty) {
      let calculateDiscount =
        (ev.offers.ItemDiscount / 100) * (price * quantity);
      form.patchValue({ discount: calculateDiscount });
    }

    if (ev.offers.ItemDiscount > 0 && quantity !== ev.offers.ItemQty) {
      form.patchValue({ discount: 0 });
    }
    //here code
    if (ev.offers.freeitems.length > 0 && quantity === ev.offers.ItemQty) {
    }
  }

  changeQuantity(ev: any, i: number) {
    console.log('ev');
  }

  submit(): void {}

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
