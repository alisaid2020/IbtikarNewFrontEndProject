import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Dimensions,
  ImageCroppedEvent,
  ImageTransform,
} from 'ngx-image-cropper';

@Component({
  selector: 'app-cropper-modal',
  templateUrl: './cropper-modal.component.html',
  styleUrls: ['./cropper-modal.component.scss'],
})
export class CropperModalComponent implements OnInit {
  @Input() imageChangedEvent: any;
  @Input() aspectRatio: number;
  croppedImage: any = '';
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  fileToReturn: any;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  imageCropped(event: ImageCroppedEvent): any {
    this.croppedImage = event.base64;
    this.fileToReturn = this.base64ToFile(
      event.base64,
      this.imageChangedEvent.target.files[0].name
    );
    return this.fileToReturn;
  }

  base64ToFile(data: any, filename: any): File {
    const arr = data.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  rotateLeft(): void {
    this.canvasRotation--;
    this.flipAfterRotate();
    console.log(this.canvasRotation);
  }

  rotateRight(): void {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate(): void {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH,
    };
  }

  flipHorizontal(): void {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  flipVertical(): void {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  resetImage(): void {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
  }

  zoomOut(): void {
    this.scale -= 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  zoomIn(): void {
    this.scale += 0.1;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  toggleContainWithinAspectRatio(): void {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation(): void {
    this.transform = {
      ...this.transform,
      rotate: this.rotation,
    };
  }
}
