/*
 * Copyright 2020 Dimpact.
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

import {Component, ViewChild} from '@angular/core';
import {CreateZaakTypeLinkRequest, ZaakType, InformatieObjectType, CreateInformatieObjectTypeLinkRequest} from '@valtimo/contract';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {OpenZaakService} from '../open-zaak.service';
import {AlertService, ModalComponent} from '@valtimo/components';
import {NGXLogger} from 'ngx-logger';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-open-zaak-type-link-extension',
  templateUrl: './open-zaak-type-link-extension.component.html',
  styleUrls: ['./open-zaak-type-link-extension.component.scss']
})
export class OpenZaakTypeLinkExtensionComponent {

  public zaakTypes: ZaakType[];
  public selectedZaakType: ZaakType;
  public informatieObjectTypes: InformatieObjectType[];
  public selectedInformatieObjectTypeUrl: string = null;
  public selectedZaakTypeUrl: string = null;
  private readonly documentDefinitionName: string;

  @ViewChild('openZaakTypeLinkModal') modal: ModalComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private openZaakService: OpenZaakService,
    private alertService: AlertService,
    private toasterService: ToastrService,
    private logger: NGXLogger,
    private translateService: TranslateService
  ) {
    this.documentDefinitionName = this.route.snapshot.paramMap.get('name');
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.openZaakService.getOpenZaakConfig().subscribe(config => {
      if (config !== null) {
        this.openZaakService.getZaakTypeLink(this.documentDefinitionName).subscribe(zaakTypeLink => {
          if (zaakTypeLink !== null) {
            this.selectedZaakTypeUrl = zaakTypeLink.zaakTypeUrl;
          }
        });
        this.loadZaakTypes();
      }
    });
  }

  loadZaakTypes() {
    return this.openZaakService.getZaakTypes().subscribe((zaakTypes: ZaakType[]) => {
      this.zaakTypes = zaakTypes;
      if (this.selectedZaakTypeUrl !== null) {
        this.selectedZaakType = this.zaakTypes.find(zaakType => zaakType.url === this.selectedZaakTypeUrl);
      }
    });
  }

  loadInformatieObjectTypeUrls() {
    this.openZaakService.getInformatieObjectTypes().subscribe((informatieObjectTypes: InformatieObjectType[]) => {
      this.informatieObjectTypes = informatieObjectTypes;
    });
  }

  openModal() {
    this.openZaakService.getOpenZaakConfig().subscribe(config => {
        if (config === null) {
          this.alertService.error(this.translateService.instant('openZaak.error.configNotFound'));
          this.logger.error('not found config test');
        } else {
          this.loadInformatieObjectTypeUrls();
          this.openZaakService.getInformatieObjectTypeLink(this.documentDefinitionName).subscribe(informatieObjectTypeLink => {
              if (informatieObjectTypeLink !== null) {
                this.logger.info('found informatieObjectTypeLink');
                this.selectedInformatieObjectTypeUrl = informatieObjectTypeLink.informatieObjectType;
              }
            }
          );
          this.modal.show();
        }
      }
    );
  }

  removeZaakTypeLink() {
    this.openZaakService.deleteZaakTypeLink(this.documentDefinitionName).subscribe(() => {
      if (this.selectedInformatieObjectTypeUrl !== null) {
        this.openZaakService.deleteInformatieObjectTypeLink(this.documentDefinitionName);
      }
      this.toasterService.success('Successfully de-linked zaaktype');
      this.selectedZaakType = null;
    }, () => {
      this.toasterService.error('Failed to de-link zaaktype');
    });
  }

  submit() {
    const request: CreateZaakTypeLinkRequest = {
      documentDefinitionName: this.documentDefinitionName,
      zaakTypeUrl: this.selectedZaakType.url
    };
    const requestInformatieObjectTypeLink: CreateInformatieObjectTypeLinkRequest = {
      documentDefinitionName: this.documentDefinitionName,
      zaakType: this.selectedZaakType.url,
      informatieObjectType: this.selectedInformatieObjectTypeUrl
    };
    this.openZaakService.createZaakTypeLink(request).subscribe(() => {
      if (requestInformatieObjectTypeLink.informatieObjectType !== null) {
        this.openZaakService.createInformatieObjectTypeLink(requestInformatieObjectTypeLink);
      }
      this.toasterService.success('Successfully linked zaaktype to dossier');
    }, err => {
      this.toasterService.error('Failed to link zaaktype to dossier');
    });
  }

}
