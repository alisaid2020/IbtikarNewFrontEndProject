import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-new-sales-invoice',
  templateUrl: './add-new-sales-invoice.component.html',
})
export class AddNewSalesInvoiceComponent implements OnInit {
  salesInvoiceForm: FormGroup;
  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    let client;
    let paymentType;
    let docDate;
    let notes;
    let saleInvoiceDetails = this.fb.array([]);

    this.salesInvoiceForm = this.fb.group({
      client: [client],
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
    return this.fb.group({
      barcode: [barcode],
      itemID: [itemID],
    });
  }
}
