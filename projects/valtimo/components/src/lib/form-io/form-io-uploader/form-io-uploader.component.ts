import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormioCustomComponent} from 'angular-formio';
import {FormIoS3Service} from '../services/form-io-s3.service';
import {BehaviorSubject} from 'rxjs';
import {S3GetReturn, UploadedFile} from '@valtimo/contract';
import {FormIoStateService} from '../services/form-io-state.service';
import {take} from 'rxjs/operators';
import {FormIoDomService} from '../services/form-io-dom.service';

@Component({
  selector: 'valtimo-formio-uploader',
  templateUrl: './form-io-uploader.component.html',
  styleUrls: ['./form-io-uploader.component.scss']
})
export class FormIoUploaderComponent implements FormioCustomComponent<UploadedFile> {
  @Input() disabled: boolean;
  @Input() title: string;
  @Input() hideTitle: boolean;
  @Input() subtitle: string;
  @Input() maxFileSize: number;
  @Input() hideMaxFileSize: boolean;
  @Input() camera: boolean;
  @Output() valueChange = new EventEmitter<UploadedFile>();

  readonly uploading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly s3Service: FormIoS3Service,
    private readonly stateService: FormIoStateService,
    private readonly domService: FormIoDomService,
  ) {
  }

  private _value: UploadedFile;

  public get value(): UploadedFile {
    return this._value;
  }

  @Input()
  public set value(value: UploadedFile) {
    this._value = value;
  }

  fileSelected(file: File) {
    this.domService.toggleSubmitButton(true);
    this.uploading$.next(true);
    this.s3Service.uploadFileToS3(file).subscribe((result) => this.setValue(result));
  }

  deleteFile(resourceId: string): void {
    this.domService.toggleSubmitButton(true);
    this.disabled = true;

    this.stateService.uploadComponent$.pipe(take(1)).subscribe((component) => {
      const value = component.getValue();
      component.setValue(value.filter((file: UploadedFile) => file.data ? file.data.s3ResourceId !== resourceId : true), {});
      this.domService.toggleSubmitButton(false);
      this.disabled = false;
      component.redraw();
    });
  }

  private setValue(result: S3GetReturn): void {
    const payload = this.s3Service.getPayloadFromS3GetReturn(result);

    this.stateService.uploadComponent$.pipe(take(1)).subscribe((component) => {
      const value = component.getValue();
      component.setValue([...value, payload], {});
      this.domService.toggleSubmitButton(false);
      this.uploading$.next(false);
      component.redraw();
    });
  }
}
