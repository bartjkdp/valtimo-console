import {S3Service} from '@valtimo/s3';
import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {S3GetReturn, S3Resource, UploadedFile} from '@valtimo/contract';
import {Injectable} from '@angular/core';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class FormIoS3Service {

  constructor(
    private readonly s3Service: S3Service
  ) {
  }

  uploadFileToS3(file: File): Observable<S3GetReturn> {
    let resourceUrl: URL;
    const fileName = file.name;
    const splitFileName = fileName.split('.');
    const fileNameWithUUID = `${splitFileName[0]}-${uuidv4()}.${splitFileName[1]}`;
    const renamedFile = new File([file], fileNameWithUUID, {type: file.type});

    return this.s3Service.getPreSignedUrl(renamedFile.name).pipe(
      map((url) => new URL(url)),
      tap((url) => resourceUrl = url),
      switchMap((url) => this.s3Service.upload(url, renamedFile)),
      map(() => new S3Resource(file, resourceUrl)),
      switchMap((s3Resource) => this.s3Service.registerResource(s3Resource)),
      switchMap((s3Resource) => this.s3Service.get(s3Resource.id)),
      map((result) => ({...result, originalName: file.name}))
    );
  }

  getPayloadFromS3GetReturn(result: S3GetReturn): UploadedFile {
    return {
      customUpload: true,
      originalName: result.originalName,
      url: result.url,
      size: result.resource.sizeInBytes,
      storage: 'url',
      data: {
        key: result.resource.key,
        bucketName: result.resource.name,
        createdOn: result.resource.createdOn as any as string,
        name: result.originalName,
        sizeInBytes: result.resource.sizeInBytes,
        s3ResourceId: result.resource.id.split('S3ResourceId(id=')[1].slice(0, -1)
      }
    };
  }
}
