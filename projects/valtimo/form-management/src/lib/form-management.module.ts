/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {NgModule} from '@angular/core';
import {FormManagementComponent} from './form-management.component';
import {FormManagementRoutingModule} from './form-management-routing.module';
import {FormIoModule, ListModule, WidgetModule} from '@valtimo/components';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormManagementCreateComponent} from './form-management-create/form-management-create.component';
import {FormManagementListComponent} from './form-management-list/form-management-list.component';
import {FormManagementEditComponent} from './form-management-edit/form-management-edit.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [FormManagementComponent, FormManagementCreateComponent, FormManagementListComponent, FormManagementEditComponent],
  imports: [
    FormManagementRoutingModule,
    FormIoModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WidgetModule,
    ListModule,
    TranslateModule,
    NgbTooltipModule
  ],
  exports: [FormManagementComponent]
})
export class FormManagementModule {

}
