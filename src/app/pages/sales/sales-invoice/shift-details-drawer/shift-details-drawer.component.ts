import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { apiUrl } from '@constants/api.constant';
import { E_USER_ROLE } from '@constants/general.constant';
import { Toast } from '@enums/toast.enum';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '@services/data.service';
import { HelpersService } from '@services/helpers.service';
import { ToastService } from '@services/toast-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { firstValueFrom, tap } from 'rxjs';

@Component({
  selector: 'app-shift-details-drawer',
  templateUrl: './shift-details-drawer.component.html',
})
export class ShiftDetailsDrawerComponent implements OnInit {
  treasuries: any;
  userRole = E_USER_ROLE;
  @Input() shiftData!: any;
  shiftDataForm!: FormGroup;
  isTreasureChanged: boolean;

  fb = inject(FormBuilder);
  helpers = inject(HelpersService);
  dataService = inject(DataService);
  activeDrawer = inject(NgbActiveOffcanvas);
  toast = inject(ToastService);
  spinner = inject(NgxSpinnerService);

  ngOnInit() {
    this.getTreasuries();
    this.initForm();
  }

  getTreasuries(): void {
    firstValueFrom(
      this.dataService.get(`${apiUrl}/Treasury/GetAllForDropDown`).pipe(
        tap((res) => {
          this.treasuries = res;
        })
      )
    );
  }

  initForm() {
    let InvoicesNo;
    let StartCash;
    let DurationCash;
    let VisaAmount;
    let BankTransferAmount;
    let DeficitAmount;
    let TotalCash;
    let treasuryIn;
    let treasuryOut;
    let TotaltreasuryIn;
    let TotaltreasuryOut;
    let SalesInvoiceReturnNo;
    let SalesInvoiceReturn;
    let TotalShift;
    let ShiftId;
    let changeTreasuryId;

    if (this.shiftData) {
      InvoicesNo = this.shiftData.SalesInvoicesNo;
      StartCash = this.shiftData.StartCash;
      DurationCash = this.shiftData.DurationCash;
      VisaAmount = this.shiftData.VisaAmount;
      BankTransferAmount = this.shiftData.BankTransferAmount;
      DeficitAmount = this.shiftData.DeficitAmount;
      TotalCash = +DurationCash + StartCash;
      treasuryIn = this.shiftData.treasuryIn;
      treasuryOut = this.shiftData.treasuryOut;
      TotaltreasuryIn = this.shiftData.treasuryIn;
      TotaltreasuryOut = this.shiftData.treasuryOut;
      SalesInvoiceReturnNo = this.shiftData.SalesInvoiceReturnNo;
      SalesInvoiceReturn = this.shiftData.SalesInvoiceReturn;
      TotalShift =
        BankTransferAmount +
        DurationCash +
        StartCash +
        TotaltreasuryIn -
        (treasuryOut + SalesInvoiceReturn);
      ShiftId = this.shiftData.Id;
      changeTreasuryId = this.shiftData.TreasuryId;
    }
    this.shiftDataForm = this.fb.group({
      InvoicesNo: [InvoicesNo],
      StartCash: [StartCash],
      DurationCash: [DurationCash],
      VisaAmount: [VisaAmount],
      BankTransferAmount: [BankTransferAmount],
      DeficitAmount: [DeficitAmount],
      TotalCash: [TotalCash],
      treasuryIn: [treasuryIn],
      treasuryOut: [treasuryOut],
      TotaltreasuryIn: [TotaltreasuryIn],
      TotaltreasuryOut: [TotaltreasuryOut],
      SalesInvoiceReturnNo: [SalesInvoiceReturnNo],
      SalesInvoiceReturn: [SalesInvoiceReturn],
      TotalShift: [TotalShift],
      ShiftId: [ShiftId],
      changeTreasuryId: [changeTreasuryId],
    });
  }

  getChangedTreasure(ev: any) {
    this.isTreasureChanged = ev.target.checked;
  }

  closeShift() {
    this.spinner.show();
    let formData = {
      RealAmount: this.shiftDataForm.value.DeficitAmount,
      IsTreasuryChanged: this.isTreasureChanged,
      TreasuryId: this.shiftDataForm.value.changeTreasuryId,
      ShiftId: this.shiftDataForm.value.ShiftId,
    };
    firstValueFrom(
      this.dataService
        .post(`${apiUrl}/ExtraAndPOS_Shift/CloseShift`, formData)
        .pipe(
          tap((res) => {
            if (res?.IsSuccess) {
              this.spinner.hide();
              this.toast.show('shiftClosedSuccessfully', {
                classname: Toast.success,
              });
              this.activeDrawer.close();
            }
          })
        )
    );
  }
}
