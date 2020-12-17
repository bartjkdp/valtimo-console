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
import {DossierManagementListComponent} from './dossier-management-list/dossier-management-list.component';
import {DossierManagementRoutingModule} from './dossier-management-routing.module';
import {DossierManagementDetailComponent} from './dossier-management-detail/dossier-management-detail.component';
import {CommonModule} from '@angular/common';
import {ListModule, ModalModule, WidgetModule} from '@valtimo/components';
import {DossierManagementConnectModalComponent} from './dossier-management-connect-modal/dossier-management-connect-modal.component';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ConfigModule, ExtensionComponent} from '@valtimo/config';

@NgModule({
  declarations: [
    DossierManagementListComponent,
    DossierManagementDetailComponent,
    DossierManagementConnectModalComponent
  ],
  imports: [
    CommonModule,
    WidgetModule,
    ListModule,
    DossierManagementRoutingModule,
    FormsModule,
    TranslateModule,
    ModalModule,
    ConfigModule
  ],
  exports: [],
  entryComponents: [ExtensionComponent]
})
export class DossierManagementModule {
}
