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

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '@valtimo/document';
import {Document, RelatedFile, S3Resource} from '@valtimo/contract';
import {ToastrService} from 'ngx-toastr';
import {S3Service} from '@valtimo/s3';

@Component({
  selector: 'valtimo-dossier-detail-tab-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DossierDetailTabDocumentsComponent implements OnInit {
  public readonly documentId: string;
  public relatedFiles: RelatedFile[] = [];
  public fields = [
    {key: 'fileName', label: 'File name'},
    {key: 'sizeInBytes', label: 'Size in bytes'},
    {key: 'createdOn', label: 'Created on', viewType: 'date'},
    {key: 'createdBy', label: 'Created by'}
  ];
  public actions = [
    {
      columnName: '',
      iconClass: 'fas fa-external-link-alt',
      callback: this.downloadDocument.bind(this)
    },
    {
      columnName: '',
      iconClass: 'fas fa-trash-alt',
      callback: this.removeRelatedFile.bind(this)
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private s3Service: S3Service,
    private toastrService: ToastrService
  ) {
    const snapshot = this.route.snapshot.paramMap;
    this.documentId = snapshot.get('documentId') || '';
  }

  loadDocuments() {
    this.documentService.getDocument(this.documentId).subscribe((document: Document) => {
      this.relatedFiles = document.relatedFiles;
    });
  }

  downloadDocument(relatedFile: RelatedFile) {
    this.s3Service.get(relatedFile.fileId).subscribe((resource: any) => {
      const link = document.createElement('a');
      link.download = relatedFile.fileName;
      link.href = resource.url;
      link.target = '_blank';
      link.click();
      link.remove();
    });
  }

  removeRelatedFile(relatedFile: RelatedFile) {
    this.documentService.removeResource(this.documentId, relatedFile.fileId).subscribe(() => {
      this.toastrService.success('Successfully removed document from dossier');
      this.loadDocuments();
    }, () => {
      this.toastrService.error('Failed to remove document from dossier');
    });
  }

  assignResource(documentResource: S3Resource) {
    this.documentService.assignResource(this.documentId, documentResource.id).subscribe(() => {
      this.toastrService.success('Successfully uploaded document to dossier');
      this.loadDocuments();
    }, () => {
      this.toastrService.error('Failed to upload document to dossier');
    });
  }

  ngOnInit() {
    this.loadDocuments();
  }
}
