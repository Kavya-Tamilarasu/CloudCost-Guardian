/**
 * Future AWS CloudWatch Metrics Interface
 * Designed to interface with @aws-sdk/client-cloudwatch
 * Queries Average/Maximum CPUUtilization, NetworkIn/Out, VolumeIdleTime, etc.
 */

export interface MetricQueryFilter {
  namespace: 'AWS/EC2' | 'AWS/EBS' | 'AWS/RDS' | 'AWS/S3' | 'AWS/NATGateway';
  metricName: 'CPUUtilization' | 'NetworkIn' | 'NetworkOut' | 'VolumeIdleTime' | 'DatabaseConnections' | 'BytesProcessed';
  dimensionName: 'InstanceId' | 'VolumeId' | 'DBInstanceIdentifier' | 'BucketName' | 'NatGatewayId';
  dimensionValue: string;
  startTime: Date;
  endTime: Date;
  periodSeconds: number; // e.g., 3600 or 86400
  statistic: 'Average' | 'Maximum' | 'Sum' | 'Minimum';
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  unit: string;
}

export interface ICloudWatchMetricsService {
  getMetricStatistics(query: MetricQueryFilter): Promise<MetricDataPoint[]>;
  getAverageCpuUtilization(instanceId: string, lookbackDays?: number): Promise<number>;
  getNetworkActivity(resourceId: string, lookbackDays?: number): Promise<{ networkInBytes: number; networkOutBytes: number }>;
}
