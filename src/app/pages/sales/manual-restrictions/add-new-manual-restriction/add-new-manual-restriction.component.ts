import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-new-manual-restriction',
  templateUrl: './add-new-manual-restriction.component.html',
})
export class AddNewManualRestrictionComponent implements OnInit {
  manualRestriction: any;
  manualRestrictionForm: FormGroup;

  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    let id;
    let docName;
    let docType;
    let docDate;
    let equivalentPrice;
    let ccenter;
    let currencyId;
    let docNoManual;
    let exchangeRate;
    let notes;

    this.manualRestrictionForm = this.fb.group({
      id: [id],
      docName: [docName],
      docType: [docType],
      docDate: [docDate],
      equivalentPrice: [equivalentPrice],
      ccenter: [ccenter],
      currencyId: [currencyId],
      docNoManual: [docNoManual],
      exchangeRate: [exchangeRate],
      notes: [notes],
    });
  }
}
