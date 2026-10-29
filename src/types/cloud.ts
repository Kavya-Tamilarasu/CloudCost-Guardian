export type CloudService = 'EC2' | 'EBS' | 'S3' | 'RDS' | 'NAT_GATEWAY' | 'ELASTIC_IP' | 'SNAPSHOT';

export type ResourceType =
  | 'EC2 Instance'
  | 'EBS Volume'
  | 'S3 Bucket'
  | 'RDS Database'
  | 'NAT Gateway'
  | 'Elastic IP'
  | 'EBS Snapshot';

export type ResourceStatus =
  | 'running'
  | 'stopped'
  | 'in-use'
  | 'available'
  | 'unattached'
  | 'active'
  | 'unassociated';

export type WasteCategory =
  | 'Idle Resource'
  | 'Underutilized Resource'
  | 'Orphaned Storage'
  | 'Unused Network Resource'
  | 'Old Snapshot'
  | 'Cost Leakage Candidate'
  | 'Healthy';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export type AlertStatus = 'Active' | 'Reviewed' | 'Dismissed';

export interface ResourceMetrics {
  cpuUtilization?: number; // percentage (0 - 100)
  memoryUtilization?: number; // percentage (0 - 100)
  storageSizeGB?: number;
  iops?: number;
  networkInBytesPerDay?: number;
  networkOutBytesPerDay?: number;
  ageDays?: number;
  attachedTo?: string | null;
  associationStatus?: string;
  lastAccessDays?: number;
  requestsPerDay?: number;
}

export interface CloudResource {
  id: string;
  name: string;
  service: CloudService;
  resourceType: ResourceType;
  status: ResourceStatus;
  region: string;
  zone: string;
  instanceType?: string;
  storageType?: string;
  storageSizeGB?: number;
  cpuUtilization?: number;
  monthlyCost: number; // in base currency INR (₹)
  wasteStatus: WasteCategory;
  severity: SeverityLevel;
  lastChecked: string;
  metrics: ResourceMetrics;
  tags: Record<string, string>;
  isWasteful: boolean;
}

export interface DetectionRule {
  id: string;
  code: string;
  name: string;
  category: WasteCategory;
  resourceType: ResourceType;
  severity: SeverityLevel;
  enabled: boolean;
  metric: string;
  operator: '<' | '>' | '<=' | '>=' | '==' | '!=';
  threshold: number | string;
  thresholdUnit: string;
  conditionDescription: string;
  recommendationTemplate: string;
  savingsFactor: number; // Fraction of cost saved (e.g., 0.6 for rightsizing, 1.0 for termination)
}

export interface WasteDetection {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: ResourceType;
  service: CloudService;
  region: string;
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  wasteCategory: WasteCategory;
  observedValue: string;
  threshold: string;
  conditionMet: string;
  severity: SeverityLevel;
  estimatedMonthlyWaste: number;
  estimatedPotentialSavings: number;
  recommendedAction: string;
  status: 'Open' | 'Resolved' | 'Ignored';
  detectedAt: string;
  explanation: {
    ruleLogic: string;
    evaluationStep: string;
    impactReason: string;
  };
}

export interface Alert {
  id: string;
  timestamp: string;
  resourceId: string;
  resourceName: string;
  service: CloudService;
  reason: string;
  severity: SeverityLevel;
  estimatedCostImpact: number;
  recommendedAction: string;
  status: AlertStatus;
  ruleCode: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type EffortLevel = 'Low' | 'Medium' | 'High';
export type RecommendationStatus = 'Pending' | 'Approved' | 'Dismissed' | 'Applied';

export interface Recommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  service: CloudService;
  problem: string;
  recommendation: string;
  action: string;
  description: string;
  currentCost: number;
  projectedCost: number;
  potentialMonthlySavings: number;
  estimatedMonthlyImpact: number;
  priority: SeverityLevel;
  ruleCode: string;
  actionType: 'Rightsize' | 'Stop Instance' | 'Delete Volume' | 'Release IP' | 'Lifecycle Archive' | 'Review';
  effortLevel: EffortLevel;
  riskLevel: RiskLevel;
  status: RecommendationStatus;
}

export interface DashboardSummary {
  totalCloudCost: number;
  potentialWaste: number;
  potentialSavings: number;
  resourcesScanned: number;
  wastefulResourcesCount: number;
  criticalIssuesCount: number;
  serviceBreakdown: {
    service: CloudService;
    cost: number;
    waste: number;
    resourceCount: number;
  }[];
  monthlyTrend: {
    month: string;
    totalCost: number;
    wasteCost: number;
    optimizedCost: number;
  }[];
  resourceHealth: {
    status: string;
    count: number;
    color: string;
  }[];
  wasteByType: {
    category: string;
    count: number;
    wasteAmount: number;
  }[];
  savingsByCategory: {
    category: string;
    savings: number;
  }[];
  recentDetections: WasteDetection[];
}

export interface UserSession {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}
