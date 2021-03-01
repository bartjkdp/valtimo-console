export interface UploadedFile {
  customUpload?: boolean;
  name?: string;
  originalName: string;
  size: number;
  storage: string;
  type?: string;
  isLast?: boolean;
  url: string;
  data: {
    baseUrl?: string;
    bucketName: string;
    createdOn: string;
    extension?: string;
    form?: string;
    key: string;
    name: string;
    project?: string;
    s3ResourceId: string;
    sizeInBytes: number;
  };
}
