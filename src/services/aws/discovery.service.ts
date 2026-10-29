/**
 * Future AWS Resource Discovery & Ingestion Pipeline Orchestrator
 *
 * PIPELINE ARCHITECTURE:
 * [AWS Cloud Infrastructure]
 *        ↓
 * [AWS SDK v3 Clients (EC2, EBS, S3, RDS)]
 *        ↓
 * [Discovery Service (Batch Ingestion)]
 *        ↓
 * [CloudWatch Metrics Ingestion (CPU, IOPS, Network)]
 *        ↓
 * [Deterministic Rule Engine]
 *        ↓
 * [Waste Detection & Cost Impact Analysis]
 *        ↓
 * [PostgreSQL Database Repository]
 *        ↓
 * [Centralized Administrator Dashboard]
 */

import { CloudResource } from '../../types/cloud';

export interface AwsDiscoveryCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  roleArn?: string;
  externalId?: string;
}

export interface AwsScanResult {
  scanId: string;
  timestamp: string;
  regionsScanned: string[];
  totalDiscovered: number;
  ec2Count: number;
  ebsCount: number;
  s3Count: number;
  rdsCount: number;
  networkCount: number;
  errors: string[];
  resources: CloudResource[];
}

export interface ICloudResourceDiscovery {
  /**
   * Validate read-only IAM credentials for AWS Cost & Resource monitoring
   */
  validateCredentials(creds: AwsDiscoveryCredentials): Promise<{ valid: boolean; accountId?: string; error?: string }>;

  /**
   * Trigger discovery across configured AWS regions
   */
  discoverAllResources(regions: string[]): Promise<AwsScanResult>;

  /**
   * Fetch CloudWatch metrics for discovered compute/storage resources
   */
  enrichWithCloudWatchMetrics(resources: CloudResource[]): Promise<CloudResource[]>;
}

export const AWS_INTEGRATION_METADATA = {
  version: '2.0.0-planned',
  status: 'Design & Interface Specification Complete (Phase 2)',
  supportedRegions: ['ap-south-1', 'us-east-1', 'us-west-2', 'eu-west-1'],
  requiredIamPolicies: [
    'arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess',
    'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
    'arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess',
    'arn:aws:iam::aws:policy/AWSBillingReadOnlyAccess'
  ]
};
