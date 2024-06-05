import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
export class AddNewSalesReturnComponent implements OnInit, OnDestroy {
  isRoundToTwoNumbers: any;
  invoiceInitObj: any;
  items: any[] = [];
  changedColumns: any;
  salesReturnFound: any;
  allColumns: any[] = [];
  userRole = E_USER_ROLE;
  salesInvoices: any[] = [];
  subs: Subscription[] = [];
  selectClients: any[] = [];
  barcodeItems: any[] = [];
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
    'TotalPriceAfterVat',
  ];
  defaultSelected: any[] = [
    { field: 'Barcode', header: 'Barcode' },
    { field: 'ItemID', header: 'ItemID' },
    { field: 'CorrectQty', header: 'CorrectQty' },
    { field: 'ReturnedQty', header: 'ReturnedQty' },
    { field: 'Quantity', header: 'Quantity' },
    { field: 'Price', header: 'Price' },
    { field: 'Vat', header: 'vat' },
    { field: 'Discount', header: 'Discount' },
    { field: 'TotalPriceAfterVat', header: 'TotalPriceAfterVat' },
  ];
  paymentTypes = [
    { name: 'cash', value: 1 },
    { name: 'debt', value: 2 },
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
    this.isRoundToTwoNumbers = this.helpers.salesSettings()?.RoundToTwoNumbers;
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
            if (res?.IsSuccess) {
              this.spinner.hide();
              this.salesReturnFound = res.Obj.invoice;
              this.extractInvoiceLines();
            }
          })
        )
    );
  }

  newLine(value?: any): FormGroup {
    let itemID;
    let productId;
    let vat = 0;
    let price = 0;
    let discount = 0;
    let returnedQty = 0;
    let saleInvoiceDetailId;
    let correctQty = 0;
    let productBarcode;
    let TotalPriceAfterVat = 0;
    let vatAmount = 0;
    let uniteId;
    let docDate;
    let quantity = 0;
    let isProductFree = false;

    if (value) {
      itemID = value.ItemID;
      productId = value.ProductId;
      vat = value.Vat;
      price = value.Price;
      discount = value.Discount;
      returnedQty = value.ReturnedQty;
      saleInvoiceDetailId = value.Id;
      correctQty = value.Quantity;
      productBarcode = value.ProductBarcode;
      TotalPriceAfterVat = value.TotalPriceAfterVat;
      vatAmount = value.VatAmount;
      uniteId = value.UniteId;
      isProductFree = value.IsProductFree;
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
      price: [price],
      discount: [discount],
      TotalPriceAfterVat: [TotalPriceAfterVat],
      docDate: [docDate],
      productBarcode: [productBarcode],
      vatAmount: [vatAmount],
      isProductFree: [isProductFree],
    });
  }

  addNewLine(value?: any): void {
    if (value) {
      this.linesArray.push(this.newLine(value));
      return;
    }
    this.linesArray.push(this.newLine());
  }

  changePaymentType(ev: any) {
    this.fillPaymentMethodWithTotal();
  }

  remove(i: number) {
    let freeCounts = this.getFreeItemsCount(i);
    if (freeCounts) {
      this.linesArray.controls.splice(i, freeCounts + 1);
      this.barcodeItems.splice(i, freeCounts + 1);
      this.items.splice(i, freeCounts + 1);
    } else {
      this.linesArray.removeAt(i);
      this.getTotalsOfInvoice();
    }
  }

  extractInvoiceLines(): void {
    this.salesInvoiceForm.patchValue({
      clientId: this.salesReturnFound.ClientId,
      paymentType: this.salesReturnFound.PaymentType,
      notes: this.salesReturnFound.Notes,
      totalNet: this.salesReturnFound.TotalInvoiceAfterVat,
      totalVat: this.salesReturnFound.TotalInvoiceVatAmount,
      totalDisc: this.salesReturnFound.TotalDisc,
      docDate: new Date(this.salesReturnFound.DocDate),
      cash: this.salesReturnFound.Cash,
      debt: this.salesReturnFound.Debt,
      saleInvoiceId: this.salesReturnFound.Id,
      isPendingPayment: this.salesReturnFound.IsPendingPayment,
      treasuryId: this.salesReturnFound.TreasuryId,
      exchangePrice: this.salesReturnFound.ExchangePrice,
      clientType: this.salesReturnFound.ClientType,
      docType: this.salesReturnFound.DocType,
      storeId: this.salesReturnFound.StoreId,
      //  saleInvoiceNo; not found from invoice come
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
      this.barcodeItems[i] = [
        {
          Barcode: line.productBarcode,
        },
      ];
    });
  }

  changeInQuantity(ev: any, i: any) {
    let form = this.linesArray.controls[i];
    let returnedQty = form.get('returnedQty')!.value;
    let soldQuantity = form.get('correctQty')!.value;
    let freeItemsCount = this.getFreeItemsCount(i);
    if (ev.value) {
      if (ev.value > soldQuantity - returnedQty) {
        this.toast.show('qtyGreaterTanSold', {
          classname: Toast.error,
        });
        return;
      }
      this.runCalculations(i);
      if (freeItemsCount) {
        for (let index = i + 1; index <= freeItemsCount; index++) {
          let tokenQuantity = soldQuantity - returnedQty - ev.value;
          let freeItemNumber =
            this.linesArray.controls[index].get('correctQty')!.value;
          let returnFreeItem = Math.floor(tokenQuantity / freeItemNumber);
          this.linesArray.controls[index].patchValue({
            quantity:
              this.linesArray.controls[index].get('correctQty')!.value -
              returnFreeItem,
          });
        }
      }
    }
  }

  getFreeItemsCount(i: any): number {
    let count = 0;
    for (let index = i + 1; index < this.linesArray.controls.length; index++) {
      if (!this.linesArray.controls[index].get('isProductFree')!.value) {
        break;
      }
      count++;
    }
    return count;
  }

  runCalculations(i: number) {
    let form = this.linesArray.controls[i];
    let price: any = form.get('price')?.value;
    let quantity: any = form.get('quantity')?.value;
    let discount: any = form.get('discount')?.value;
    let vat: any = form.get('vat')?.value;
    let allQuantity = form.get('correctQty')?.value;
    let totalPriceAfterVat: any = form.get('TotalPriceAfterVat')?.value;
    let vatAmount: any;

    if (!this.isRoundToTwoNumbers) {
      discount = Math.round(discount / allQuantity);
      let p1 = Math.round(price * quantity);
      let p2 = Math.round(p1 - discount);
      let p3 = Math.round(p2 * vat);
      vatAmount = Math.round(p3 / 100);
      totalPriceAfterVat = p2 + vatAmount;
    } else {
      discount = Math.round((discount / allQuantity) * 100) / 100;
      let part1 = Math.round(price * quantity * 100) / 100;
      let part2 = Math.round((part1 - discount) * 100) / 100;
      let part3 = Math.round(part2 * vat * 100) / 100;
      vatAmount = Math.round((part3 / 100) * 100) / 100;
      totalPriceAfterVat = Math.round((part2 + vatAmount) * 100) / 100;
    }
    form.patchValue({
      TotalPriceAfterVat: totalPriceAfterVat,
      vatAmount: vatAmount,
    });
    this.getTotalsOfInvoice();
  }

  getTotalsOfInvoice(): void {
    let totalNet = this.linesArray.controls
      .map((line: any) => +line.value?.TotalPriceAfterVat)
      .reduce((acc, curr) => acc + curr, 0);

    let totalVat = this.linesArray.controls
      .map((line: any) => +line.value?.vatAmount)
      .reduce((acc, curr) => acc + curr, 0);

    let totalDisc = this.linesArray.controls
      .map((line: any) => +line.value?.discount)
      .reduce((acc, curr) => acc + curr, 0);

    if (!this.isRoundToTwoNumbers) {
      this.salesInvoiceForm.patchValue({
        totalNet: Math.round(totalNet),
        totalVat: Math.round(totalVat),
        totalDisc: Math.round(totalDisc),
      });
    } else {
      this.salesInvoiceForm.patchValue({
        totalNet: Math.round(totalNet * 100) / 100,
        totalVat: Math.round(totalVat * 100) / 100,
        totalDisc: Math.round(totalDisc * 100) / 100,
      });
    }
    this.fillPaymentMethodWithTotal();
  }

  fillPaymentMethodWithTotal(): void {
    let paymentType = this.salesInvoiceForm.get('paymentType')!.value;
    let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
    if (paymentType === 1) {
      this.salesInvoiceForm.patchValue({ cash: totalNet, debt: 0 });
    }
    if (paymentType === 2) {
      this.salesInvoiceForm.patchValue({
        debt: totalNet,
        cash: 0,
      });
    }
  }

  changeInCash(ev: any): void {
    let val = ev.value;
    let totalNet = this.salesInvoiceForm.get('totalNet')!.value;
    this.salesInvoiceForm.patchValue({
      debt: totalNet - val,
    });
  }

  salesInvoiceInit(): void {
    firstValueFrom(
      this.dataService
        .get(`${apiUrl}/XtraAndPos_GeneralLookups/SalesInvoiceInit`)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.invoiceInitObj = res.Obj;
              if (this.invoiceInitObj.isSalesPerson) {
                this.salesInvoiceForm.get('paymentType')?.setValue(2);
              }
              if (!this.invoiceInitObj.isSalesPerson) {
                this.salesInvoiceForm.get('paymentType')?.setValue(1);
              }
            }
          })
        )
    );
  }

  submit(): void {
    this.spinner.show();
    let formValue = {
      ...this.salesInvoiceForm.value,
      saleInvoiceReturnDetails: this.helpers.removeEmptyLines(this.linesArray),
    };
    if (
      this.helpers.getItemFromLocalStorage(this.userRole) === 'Admin' ||
      this.invoiceInitObj?.isSalesPerson
    ) {
      formValue.docDate = formValue.docDate.toISOString();
    } else {
      delete formValue.docDate;
    }
    firstValueFrom(
      this.dataService
        .post(
          `${apiUrl}/XtraAndPos_StoreInvoiceReturn/CreateInvoiceReturnForMobile`,
          formValue
        )
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.spinner.hide();
              this.toast.show(Toast.added, { classname: Toast.success });
              this.router.navigateByUrl('/sales-return');
            }
          })
        )
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
