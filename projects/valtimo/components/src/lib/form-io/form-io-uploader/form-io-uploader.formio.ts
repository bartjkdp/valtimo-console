import {Injector} from '@angular/core';
import {FormioCustomComponentInfo, registerCustomFormioComponent} from 'angular-formio';
import {FormIoUploaderComponent} from './form-io-uploader.component';
import {formIoUploaderEditForm} from './form-io-uploader-edit-form';

export const customUploaderType = 'valtimo-file';

const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  type: customUploaderType,
  selector: 'valtimo-form-io-uploader',
  title: 'Valtimo File Upload',
  group: 'basic',
  icon: 'upload',
  editForm: formIoUploaderEditForm,
};

export function registerFormioUploadComponent(injector: Injector) {
  registerCustomFormioComponent(COMPONENT_OPTIONS, FormIoUploaderComponent, injector);
}
