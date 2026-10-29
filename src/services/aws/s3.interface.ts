/**
 * Future AWS S3 (Simple Storage Service) Interface
 * Designed to interface with @aws-sdk/client-s3
 */

export interface RawAwsS3Bucket {
  Name: string;
  CreationDate: string;
  Region?: string;
  SizeBytes?: number;
  ObjectCount?: number;
  LifecycleConfiguration?: {
    Rules?: Array<{
      Id: string;
      Status: 'Enabled' | 'Disabled';
      DaysAfterInitiation?: number;
      ExpirationDays?: number;
    }>;
  };
  LastAccessDays?: number;
}

export interface IS3DiscoveryService {
  listBuckets(): Promise<RawAwsS3Bucket[]>;
  getBucketMetrics(bucketName: string): Promise<{ sizeBytes: number; objectCount: number; lastModifiedDate: string }>;
  applyLifecycleRule(bucketName: string, transitionDays: number): Promise<{ success: boolean; message: string }>;
}
