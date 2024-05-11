import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { apiUrl } from '@constants/api.constant';
import { DataService } from '@services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { TableService } from '@services/table.service';
import { E_USER_ROLE } from '@constants/general.constant';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { HelpersService } from '@services/helpers.service';
import { Subscription, firstValueFrom, map, tap } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ShiftDetailsDrawerComponent } from '../shift-details-drawer/shift-details-drawer.component';
import { ToastService } from '@services/toast-service';
import { Toast } from '@enums/toast.enum';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit, OnDestroy {
  shiftData: any;
  items: any = [];
  changedColumns: any;
  itemsUnits: any = [];
  allColumns: any[] = [];
  barcodeItems: any[] = [];
  invoiceInitObj: any;
  IsMustOpenShift: boolean;
  userRole = E_USER_ROLE;
  subs: Subscription[] = [];
  salesInvoiceForm: FormGroup;
  _selectedColumns: any[] = [];
  barcodeControls = [new FormControl()];
  tableStorage = 'salesInvoiceLines-table';
  defaultStorage = 'salesInvoiceLines-default-selected';
  clientsApi = `${apiUrl}/XtraAndPos_GeneralLookups/CustomerByTerm`;
  itemsByTermApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemsByTrim`;
  itemsByBarcodeApi = `${apiUrl}/XtraAndPos_GeneralLookups/GetItemByBarcode`;
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

  fb = inject(FormBuilder);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  tableService = inject(TableService);
  translate = inject(TranslateService);
  offcanvasService = inject(NgbOffcanvas);
  toast = inject(ToastService);

  async ngOnInit() {
    this.salesInvoiceInit();
    this.checkIfUserShiftOpened();
    this.getShiftInfo();
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
    let docDate = new Date();
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
    let totalDisc = 0;
    let totalVat = 0;
    let totalNet = 0;

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
    let total = 0;
    return this.fb.group({
      itemID: [itemID],
      uniteId: [uniteId],
      vat: [vat],
      productId: [productId],
      quantity: [quantity],
      balance: [balance],
      price: [price],
      discount: [discount],
      total: [total],
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
            this.invoiceInitObj = res.Obj;
            if (this.invoiceInitObj.isSalesPerson) {
              this.salesInvoiceForm.get('paymentType')?.setValue(2);
            }
            if (!this.invoiceInitObj.isSalesPerson) {
              this.salesInvoiceForm.get('paymentType')?.setValue(1);
            }
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

  selectedItemByBarcode(ev: any, i: number) {
    if (ev) {
      this.items[i] = [{ ...ev, NameAr: ev.Item?.NameAr }];
      this.itemsUnits[i] = [{ unitId: ev?.UnitId, name: ev?.UnitName }];
      this.linesArray.controls[i].patchValue({
        itemID: ev.ItemId,
        uniteId: ev.UnitId,
        vat: ev.Vat,
        productId: ev.Id,
      });
      this.getBalance(ev, i);
      this.getPrice(ev, i);
    }
  }

  selectedItemByName(ev: any, i: number): void {
    let form = this.linesArray.controls[i];
    if (ev) {
      ev.ItemUnits.forEach((el: any) => {
        el.name = el.UnitName;
        el.unitId = el.UnitId;
      });
      this.itemsUnits[i] = ev.ItemUnits;
      if (this.itemsUnits[i]?.length && this.itemsUnits[i][0]?.Barcode) {
        form.patchValue({
          unitId: this.itemsUnits[i][0]?.unitId,
        });
        this.selectedUnit(this.itemsUnits[i][0], i);
      }
    }
  }

  selectedUnit(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    this.barcodeItems[i] = [ev];
    this.barcodeControls[i].setValue(ev?.Barcode);
    form.patchValue({ vat: ev?.Vat, productId: ev?.Id });
    this.getBalance(ev, i);
    this.getPrice(ev, i);
  }

  getBalance(ev: any, i: number): void {
    let params = {
      itemUnitId: ev.Id,
      storeId: this.invoiceInitObj.empStore,
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
            this.checkForOffers(res.Obj, i);
          })
        )
    );
  }

  checkForOffers(itemPriceObj: any, i: number) {
    let form = this.linesArray.controls[i];
    let quantity = form.get('quantity')?.value;
    let balance = form.get('balance')?.value;
    let price = form.get('price')?.value;
    if (balance < quantity && this.invoiceInitObj.saleByMinus) {
      this.addNewLine();
    } else {
      this.toast.show('Item Balance Not Allowed', {
        classname: Toast.error,
      });
    }
    if (itemPriceObj.offers.ItemDiscount > 0) {
      if (quantity == itemPriceObj.offers.ItemQty) {
        let discountValue =
          quantity * price * (itemPriceObj.offers.ItemDiscount / 100);
        form.patchValue({ discount: discountValue });
      } else {
        form.patchValue({ discount: 0 });
      }
    }
    if (itemPriceObj.offers.freeitems.length > 0) {
      if (quantity == itemPriceObj.offers.ItemQty) {
      }
    }
    this.runCalculations(i);
  }

  changeCalculation(ev: any, i: number) {
    this.runCalculations(i);
  }

  runCalculations(i: number) {
    let form = this.linesArray.controls[i];
    let quantity = form.get('quantity')?.value;
    let price = form.get('price')?.value;
    let vat = form.get('vat')?.value;
    let total = form.get('total')?.value;
    let discount = form.get('discount')?.value;
    let vatValue = ((price * quantity - discount) * vat) / 100;
    total = price * quantity - discount + vatValue;
    form.patchValue({
      total: total,
    });
    this.getTotalsOfInvoice();
  }

  getTotalsOfInvoice(): void {
    const totalNet = this.linesArray.controls
      .map((line: any) => line.value?.total)
      .reduce((acc, curr) => acc + curr, 0);

    const totalVat = this.linesArray.controls
      .map((line: any) => line.value?.vat)
      .reduce((acc, curr) => acc + curr, 0);

    const totalDisc = this.linesArray.controls
      .map((line: any) => line.value?.discount)
      .reduce((acc, curr) => acc + curr, 0);

    this.salesInvoiceForm.patchValue({
      totalNet,
      totalVat,
      totalDisc,
      cash: totalNet,
    });
  }

  checkIfUserShiftOpened(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/ExtraAndPOS_Shift/IsUserShiftOpened`)
        .pipe(
          tap((res) => {
            if (
              res.Obj.IsUserShiftOpened &&
              (res.Obj.IsMustOpenShift || res.Obj?.IsMustOpenShift == undefined)
            ) {
              this.IsMustOpenShift = true;
            }
          })
        )
    );
  }

  getShiftInfo(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/ExtraAndPOS_Shift/GetShiftInfo`).pipe(
        tap((res) => {
          this.shiftData = res.Obj;
        })
      )
    );
  }

  openShiftDetails(): void {
    const offCanvasRef = this.offcanvasService.open(
      ShiftDetailsDrawerComponent,
      {
        position: this.translate.currentLang == 'ar' ? 'start' : 'end',
        scroll: true,
        panelClass: 'w-100 w-md-50',
      }
    );
    offCanvasRef.componentInstance.shiftData = this.shiftData;
  }

  submit(): void {
    let formValue = { ...this.salesInvoiceForm.value };
    if (
      this.helpers.getItemFromLocalStorage(this.userRole) !== 'Admin' ||
      !this.invoiceInitObj?.isSalesPerson
    ) {
      delete formValue.docDate;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
