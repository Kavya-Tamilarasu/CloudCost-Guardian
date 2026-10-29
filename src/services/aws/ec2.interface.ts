/**
 * Future AWS EC2 Integration Interface
 * Designed to interface with @aws-sdk/client-ec2
 * Compatible with DescribeInstancesCommand, DescribeVolumesCommand, etc.
 */

export interface AwsEc2Config {
  region: string;
  accessKeyIdPlaceholder?: string;
  secretAccessKeyPlaceholder?: string;
  roleArn?: string;
}

export interface RawAwsEc2Instance {
  InstanceId: string;
  InstanceType: string;
  State: {
    Name: 'pending' | 'running' | 'shutting-down' | 'terminated' | 'stopping' | 'stopped';
    Code: number;
  };
  LaunchTime: string;
  Placement?: {
    AvailabilityZone: string;
  };
  Tags?: Array<{ Key: string; Value: string }>;
  BlockDeviceMappings?: Array<{
    DeviceName: string;
    Ebs?: {
      VolumeId: string;
      Status: string;
      AttachTime: string;
      DeleteOnTermination: boolean;
    };
  }>;
}

export interface IEc2DiscoveryService {
  describeInstances(region?: string): Promise<RawAwsEc2Instance[]>;
  stopInstance(instanceId: string): Promise<{ success: boolean; message: string }>;
  modifyInstanceType(instanceId: string, targetType: string): Promise<{ success: boolean; message: string }>;
}
