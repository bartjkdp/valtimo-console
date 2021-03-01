import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {createCustomFormioComponent} from 'angular-formio/custom-component/create-custom-component';
import {FormioComponent} from 'angular-formio';
import {take} from 'rxjs/operators';
import {FormioBeforeSubmit} from 'angular-formio/formio.common';
import {customUploaderType} from '../form-io-uploader/form-io-uploader.formio';

type CustomComponent = InstanceType<ReturnType<typeof createCustomFormioComponent>>;

@Injectable()
export class FormIoStateService {
  private _currentForm$ = new BehaviorSubject<FormioComponent>(undefined);

  public get currentForm$(): Observable<FormioComponent> {
    return this._currentForm$.asObservable();
  }

  public set currentForm(form: FormioComponent) {
    const valtimoFiles = form.form.components.find((component) => component.type === customUploaderType);
    const uploadComponent = valtimoFiles && form.formio.getComponent(valtimoFiles.key);
    this._currentForm$.next(form);

    if (uploadComponent) {
      this.uploadComponent = uploadComponent;
      form.options.hooks.beforeSubmit = this.handleResourcesOnSubmit.bind(this);
      this.setComponentValue();
    }
  }

  private _uploadComponent$ = new BehaviorSubject<CustomComponent>(undefined);

  public get uploadComponent$(): Observable<CustomComponent> {
    return this._uploadComponent$.asObservable();
  }

  public set uploadComponent(component: CustomComponent) {
    this._uploadComponent$.next(component);
  }

  public setUploadToMultipleIfExists(form: any): any {
    const customUploadIndex = form.components
      .findIndex((component) => component?.type === customUploaderType);

    if (customUploadIndex !== -1) {
      form.components[customUploadIndex].multiple = true;
    }

    return form;
  }

  public setComponentValue() {
    this.uploadComponent$.pipe(take(1)).subscribe((component) => {
      if (component) {
        const value = component.getValue();
        if (!value || !Array.isArray(value) || value.length === 0 || !value[0]) {
          component.setValue([{}], {});
        } else if (value[0].originalName) {
          component.setValue([{}, ...value], {});
        }
        component.redraw();
      }
    });
  }

  private handleResourcesOnSubmit: FormioBeforeSubmit = (submission, next) => {
    this._uploadComponent$.pipe(take(1)).subscribe((component) => {
      const callback = () => next(undefined, submission);
      const componentKey = component.originalComponent.key;
      const attachments = (submission as any).data[componentKey];

      if (attachments) {
        (submission as any).data[componentKey] = attachments.filter((attachment) => attachment.originalName);
      }

      callback();
    });
  }
}
