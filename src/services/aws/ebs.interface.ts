/**
 * Future AWS EBS (Elastic Block Store) Interface
 * Designed to interface with @aws-sdk/client-ec2 (DescribeVolumes, DescribeSnapshots)
 */

export interface RawAwsEbsVolume {
  VolumeId: string;
  Size: number; // in GiB
  VolumeType: 'gp2' | 'gp3' | 'io1' | 'io2' | 'st1' | 'sc1' | 'standard';
  State: 'creating' | 'available' | 'in-use' | 'deleting' | 'deleted' | 'error';
  CreateTime: string;
  AvailabilityZone: string;
  Iops?: number;
  Attachments?: Array<{
    InstanceId: string;
    VolumeId: string;
    State: string;
    AttachTime: string;
    DeleteOnTermination: boolean;
  }>;
  Tags?: Array<{ Key: string; Value: string }>;
}

export interface RawAwsSnapshot {
  SnapshotId: string;
  VolumeId: string;
  VolumeSize: number;
  StartTime: string;
  State: 'pending' | 'completed' | 'error';
  Description?: string;
  OwnerId: string;
  Tags?: Array<{ Key: string; Value: string }>;
}

export interface IEbsDiscoveryService {
  describeVolumes(region?: string): Promise<RawAwsEbsVolume[]>;
  describeSnapshots(ownerId?: string, region?: string): Promise<RawAwsSnapshot[]>;
  deleteVolume(volumeId: string): Promise<{ success: boolean; message: string }>;
  deleteSnapshot(snapshotId: string): Promise<{ success: boolean; message: string }>;
}
