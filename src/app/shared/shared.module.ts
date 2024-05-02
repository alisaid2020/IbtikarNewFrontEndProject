import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbAccordionModule,
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbOffcanvasModule,
  NgbPaginationModule,
  NgbProgressbar,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgOtpInputModule } from 'ng-otp-input';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatSliderModule } from '@angular/material/slider';
import { NgSelectModule } from '@ng-select/ng-select';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CropperModalComponent } from './components/cropper-modal/cropper-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { CountdownModule } from 'ngx-countdown';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ScriptsInitComponent } from '../_metronic/layout/components/scripts-init/scripts-init.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MotamaratSelectComponent } from './components/motamarat-select/motamarat-select.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EbtikarInputComponent } from './components/ebtikar-input/ebtikar-input.component';
import { AppArrowFocusDirective } from './directives/app-arrow-focus.directive';

const sharedModules: any[] = [
  NgApexchartsModule,
  InlineSVGModule,
  FormsModule,
  ReactiveFormsModule,
  NgOtpInputModule,
  NgbDatepickerModule,
  NgbOffcanvasModule,
  TranslateModule,
  NgbAccordionModule,
  NgbPaginationModule,
  SweetAlert2Module,
  MatSliderModule,
  NgSelectModule,
  NgbNavModule,
  NgbProgressbar,
  ImageCropperModule,
  // NgbDropdownModule,
  MatCheckboxModule,
  // NgbTooltipModule,
  CountdownModule,
  DragDropModule,
  FlatpickrModule,
  NgxIntlTelInputModule,
  NgxSpinnerModule,
  BsDatepickerModule.forRoot(),
  CKEditorModule,
  NgxMaterialTimepickerModule,
  TranslateModule,
];
const sharedComponents: any[] = [
  EbtikarInputComponent,
  SubmitButtonComponent,
  CropperModalComponent,
  ConfirmModalComponent,
  MotamaratSelectComponent,
  FileUploadComponent,
  AppArrowFocusDirective,
  ScriptsInitComponent,

];

@NgModule({
  declarations: [sharedComponents],
  imports: [CommonModule, sharedModules],
  exports: [CommonModule, sharedModules, sharedComponents],
})
export class SharedModule {}
