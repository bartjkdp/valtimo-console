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

import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DocumentSearchRequest, DocumentSearchRequestImpl, DocumentService} from '@valtimo/document';
import {ProcessDocumentDefinition} from '@valtimo/contract';
import {DossierService} from '../dossier.service';
import * as momentImported from 'moment';
import {DefaultTabs} from '../dossier-detail-tab-enum';
import {DossierProcessStartModalComponent} from '../dossier-process-start-modal/dossier-process-start-modal.component';

declare var $;

const moment = momentImported;
moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-dossier-list',
  templateUrl: './dossier-list.component.html',
  styleUrls: ['./dossier-list.component.css']
})
export class DossierListComponent implements OnInit {

  public documentDefinitionName = '';
  public implementationDefinitions: any;
  public showCreateDocument = false;
  public schema: any;
  public documents: any;
  public items: Array<any> = [];
  public fields: Array<any> = [];
  public processDefinitionListFields: Array<any> = [];
  public processDocumentDefinitions: ProcessDocumentDefinition[] = [];
  public pagination = {
    collectionSize: 0,
    page: 0,
    size: 10,
    maxPaginationItemSize: 5
  };
  public searchCriteria: string | undefined;
  public sequence: number | undefined;
  public createdBy: string | undefined;
  private selectedProcessDocumentDefinition: ProcessDocumentDefinition | null = null;
  private modalListenerAdded = false;
  @ViewChild('processStartModal') processStart: DossierProcessStartModalComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private dossierService: DossierService
  ) {
  }

  ngOnInit() {
    this.doInit();
    this.routeEvent(this.router);
    this.modalListenerAdded = false;
  }

  paginationSet() {
    this.getData();
  }

  private routeEvent(router: Router) {
    router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.doInit();
        this.getData();
      }
    });
  }

  public doInit() {
    this.documentDefinitionName = this.route.snapshot.paramMap.get('documentDefinitionName') || '';
    this.implementationDefinitions = this.dossierService.getImplementationEnvironmentDefinitions(this.documentDefinitionName);

    if (this.implementationDefinitions && this.implementationDefinitions.definitions.list.fields) {
      this.showCreateDocument = this.implementationDefinitions.definitions.list.showCreateDocument;
      this.fields = this.implementationDefinitions.definitions.list.fields;
    } else {
      this.showCreateDocument = false;
      this.fields = [
        {
          key: 'sequence',
          label: 'Reference number'
        },
        {
          key: 'createdBy',
          label: 'Created by'
        },
        {
          key: 'createdOn',
          label: 'Created on',
          viewType: 'date'
        },
        {
          key: 'modifiedOn',
          label: 'Last modified',
          viewType: 'date'
        }];
    }
  }

  public getData() {
    this.findDocumentDefinition(this.documentDefinitionName);

    if (this.hasCachedSearchRequest()) {
      const documentSearchRequest = this.getCachedSearch();
      this.searchCriteria = documentSearchRequest.searchCriteria;
      this.sequence = documentSearchRequest.sequence;
      this.createdBy = documentSearchRequest.createdBy;
      this.findDocuments(documentSearchRequest);
    } else {
      this.doSearch();
    }

    this.getAllAssociatedProcessDefinitions();
  }

  public doSearch() {
    const documentSearchRequest = this.buildDocumentSearchRequest();
    this.findDocuments(documentSearchRequest);
  }

  private findDocuments(documentSearchRequest: DocumentSearchRequest) {
    return this.documentService.getDocuments(documentSearchRequest).subscribe(documents => {
      this.documents = documents;
      this.transformDocuments(this.documents.content);
      this.pagination.collectionSize = this.documents.totalElements;
      this.storeSearch(documentSearchRequest);
    });
  }

  public getAllAssociatedProcessDefinitions() {
    this.documentService.findProcessDocumentDefinitions(this.documentDefinitionName).subscribe(processDocumentDefinitions => {
      this.processDocumentDefinitions = processDocumentDefinitions
        .filter(processDocumentDefinition => processDocumentDefinition.canInitializeDocument);
      this.processDefinitionListFields = [{
        key: 'processName',
        label: 'Proces'
      }];
    });
  }

  public getCachedSearch(): DocumentSearchRequest {
    const json = JSON.parse(this.getCachedDocumentSearchRequest());
    return new DocumentSearchRequestImpl(
      json.definitionName,
      this.pagination.page - 1,
      this.pagination.size,
      json.sequence,
      json.createdBy,
      json.searchCriteria
    );
  }

  private buildDocumentSearchRequest(): DocumentSearchRequest {
    return new DocumentSearchRequestImpl(
      this.documentDefinitionName,
      this.pagination.page - 1,
      this.pagination.size,
      this.sequence,
      this.createdBy,
      this.searchCriteria
    );
  }

  private storeSearch(documentSearchRequest: DocumentSearchRequest) {
    localStorage.setItem(this.getCachedKey(), JSON.stringify(documentSearchRequest));
  }

  private getCachedDocumentSearchRequest(): string {
    return localStorage.getItem(this.getCachedKey()) || '';
  }

  private hasCachedSearchRequest(): boolean {
    return localStorage.getItem(this.getCachedKey()) !== null;
  }

  private getCachedKey(): string {
    return 'list-search-' + this.documentDefinitionName;
  }

  public rowClick(document: any) {
    this.router.navigate([`/dossiers/${this.documentDefinitionName}/document/${document.id}/${DefaultTabs.summary}`]);
  }

  public startDossier() {
    if (this.processDocumentDefinitions.length > 1) {
      $('#startProcess').modal('show');
    } else {
      this.selectedProcessDocumentDefinition = this.processDocumentDefinitions[0];
      this.showStartProcessModal();
    }
  }

  private showStartProcessModal() {
    if (this.selectedProcessDocumentDefinition !== null) {
      this.processStart.openModal(this.selectedProcessDocumentDefinition);
      this.selectedProcessDocumentDefinition = null;
    }
  }

  public selectProcess(processDocumentDefinition: ProcessDocumentDefinition) {
    const modal = $('#startProcess');
    if (!this.modalListenerAdded) {
      modal.on('hidden.bs.modal', this.showStartProcessModal.bind(this));
      this.modalListenerAdded = true;
    }
    this.selectedProcessDocumentDefinition = processDocumentDefinition;
    modal.modal('hide');
  }

  private findDocumentDefinition(documentDefinitionName: string) {
    this.documentService.getDocumentDefinition(documentDefinitionName).subscribe(definition => {
      this.schema = definition.schema;
    });
  }

  private transformDocuments(documentsContent: Array<any>) {
    this.items = documentsContent.map(document => {
      const {content, ...others} = document;
      return {...content, ...others};
    });
  }

  public paginationClicked(page: number) {
    this.pagination.page = page;
    this.doSearch();
  }

}
