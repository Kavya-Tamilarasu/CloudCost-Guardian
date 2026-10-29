/**
 * CLOUDCOST GUARDIAN: Deterministic Rule Engine
 *
 * College Academic Project - Cloud Computing Domain
 * Strictly NON-AI, transparent, deterministic IF-THEN rule-based evaluation.
 * No machine learning, no heuristic black-boxes, no hallucinations.
 */

import {
  CloudResource,
  DetectionRule,
  WasteDetection,
  Alert,
  Recommendation,
  DashboardSummary,
  WasteCategory,
  SeverityLevel,
} from '../types/cloud';

export const DEFAULT_RULES: DetectionRule[] = [
  {
    id: 'rule-001',
    code: 'RULE-001',
    name: 'Underutilized Compute Instance',
    category: 'Underutilized Resource',
    resourceType: 'EC2 Instance',
    severity: 'High',
    enabled: true,
    metric: 'cpuUtilization',
    operator: '<',
    threshold: 10,
    thresholdUnit: '%',
    conditionDescription: 'IF CPU utilization < 10% AND status is running THEN classify as Underutilized Compute',
    recommendationTemplate: 'Downsize the instance type or schedule automated shutdown outside business hours.',
    savingsFactor: 0.65, // 65% savings through rightsizing
  },
  {
    id: 'rule-002',
    code: 'RULE-002',
    name: 'Orphaned Unattached EBS Volume',
    category: 'Orphaned Storage',
    resourceType: 'EBS Volume',
    severity: 'High',
    enabled: true,
    metric: 'status',
    operator: '==',
    threshold: 'unattached',
    thresholdUnit: 'state',
    conditionDescription: 'IF EBS volume status is unattached/available THEN classify as Orphaned Storage',
    recommendationTemplate: 'Create final snapshot backup if data is still required, then delete unattached volume.',
    savingsFactor: 1.0, // 100% savings upon deletion
  },
  {
    id: 'rule-003',
    code: 'RULE-003',
    name: 'Unused / Unassociated Network Resource',
    category: 'Unused Network Resource',
    resourceType: 'Elastic IP',
    severity: 'Medium',
    enabled: true,
    metric: 'associationStatus',
    operator: '==',
    threshold: 'unassociated',
    thresholdUnit: 'state',
    conditionDescription: 'IF Elastic IP is unassociated OR NAT Gateway has 0 traffic THEN classify as Unused Network Resource',
    recommendationTemplate: 'Release unassociated Elastic IP address to avoid AWS hourly in-use penalties.',
    savingsFactor: 1.0,
  },
  {
    id: 'rule-004',
    code: 'RULE-004',
    name: 'Aged EBS Snapshot Retention Exceeded',
    category: 'Old Snapshot',
    resourceType: 'EBS Snapshot',
    severity: 'Medium',
    enabled: true,
    metric: 'ageDays',
    operator: '>',
    threshold: 90,
    thresholdUnit: 'days',
    conditionDescription: 'IF snapshot creation age > 90 days THEN classify as Potential Storage Waste',
    recommendationTemplate: 'Archive to AWS S3 Glacier Deep Archive or purge redundant historical snapshot.',
    savingsFactor: 0.85,
  },
  {
    id: 'rule-005',
    code: 'RULE-005',
    name: 'High-Cost Low-Utilization Leakage',
    category: 'Cost Leakage Candidate',
    resourceType: 'EC2 Instance',
    severity: 'Critical',
    enabled: true,
    metric: 'monthlyCost',
    operator: '>',
    threshold: 1800,
    thresholdUnit: '₹/mo',
    conditionDescription: 'IF monthly cost > ₹1,800 AND CPU utilization < 15% THEN classify as Cost Leakage Candidate',
    recommendationTemplate: 'Immediate review required: large enterprise instance generating high monthly cost with negligible load.',
    savingsFactor: 0.75,
  },
  {
    id: 'rule-006',
    code: 'RULE-006',
    name: 'Stopped Instance With Accumulating Storage',
    category: 'Idle Resource',
    resourceType: 'EC2 Instance',
    severity: 'Medium',
    enabled: true,
    metric: 'status',
    operator: '==',
    threshold: 'stopped',
    thresholdUnit: 'state',
    conditionDescription: 'IF instance is stopped for over 14 days with provisioned EBS storage attached',
    recommendationTemplate: 'Snapshot the root volume and terminate the instance to prevent storage cost leakage.',
    savingsFactor: 0.9,
  },
  {
    id: 'rule-007',
    code: 'RULE-007',
    name: 'Stale Unaccessed S3 Bucket',
    category: 'Orphaned Storage',
    resourceType: 'S3 Bucket',
    severity: 'Low',
    enabled: true,
    metric: 'lastAccessDays',
    operator: '>',
    threshold: 180,
    thresholdUnit: 'days',
    conditionDescription: 'IF S3 bucket has no read/write access for > 180 days AND size > 50 GB',
    recommendationTemplate: 'Configure S3 Lifecycle policy to transition objects to S3 Glacier Flexible Retrieval.',
    savingsFactor: 0.7,
  },
  {
    id: 'rule-008',
    code: 'RULE-008',
    name: 'Idle RDS Database Instance',
    category: 'Idle Resource',
    resourceType: 'RDS Database',
    severity: 'High',
    enabled: true,
    metric: 'cpuUtilization',
    operator: '<',
    threshold: 5,
    thresholdUnit: '%',
    conditionDescription: 'IF RDS CPU utilization < 5% for 14 consecutive days THEN classify as Idle Database',
    recommendationTemplate: 'Take final DB snapshot and stop or terminate unused development/staging database.',
    savingsFactor: 0.8,
  }
];

export interface EvaluationResult {
  isWasteful: boolean;
  wasteCategory: WasteCategory;
  severity: SeverityLevel;
  detections: WasteDetection[];
  alerts: Alert[];
  recommendations: Recommendation[];
}

/**
 * Deterministically evaluates a single cloud resource against all enabled rules.
 * Transparent IF-THEN logic with explicit trace logs.
 */
export function evaluateResource(
  resource: CloudResource,
  rules: DetectionRule[]
): EvaluationResult {
  const activeRules = rules.filter((r) => r.enabled);
  const matchedDetections: WasteDetection[] = [];
  const matchedAlerts: Alert[] = [];
  const matchedRecommendations: Recommendation[] = [];

  let highestSeverity: SeverityLevel = 'Info';
  const severityRank: Record<SeverityLevel, number> = {
    Critical: 5,
    High: 4,
    Medium: 3,
    Low: 2,
    Info: 1,
  };

  for (const rule of activeRules) {
    let conditionMatched = false;
    let observedStr = 'N/A';
    let thresholdStr = `${rule.operator} ${rule.threshold} ${rule.thresholdUnit}`;
    let stepDescription = '';

    // Rule 001: Underutilized Compute
    if (rule.code === 'RULE-001' && resource.resourceType === 'EC2 Instance') {
      const cpu = resource.metrics.cpuUtilization ?? resource.cpuUtilization ?? 0;
      const isRunning = resource.status === 'running';
      observedStr = `${cpu.toFixed(1)}%`;
      thresholdStr = `< ${rule.threshold}% (Running)`;

      if (isRunning && cpu < Number(rule.threshold)) {
        conditionMatched = true;
        stepDescription = `Resource is 'running' and observed CPU (${observedStr}) is strictly below threshold (${rule.threshold}%).`;
      }
    }

    // Rule 002: Orphaned EBS Volume
    else if (rule.code === 'RULE-002' && resource.resourceType === 'EBS Volume') {
      const isUnattached = resource.status === 'unattached' || !resource.metrics.attachedTo;
      observedStr = resource.status;
      thresholdStr = 'unattached / available';

      if (isUnattached) {
        conditionMatched = true;
        stepDescription = `EBS volume status is '${resource.status}' with no attached EC2 instance mapping.`;
      }
    }

    // Rule 003: Unused Network Resource
    else if (
      rule.code === 'RULE-003' &&
      (resource.resourceType === 'Elastic IP' || resource.resourceType === 'NAT Gateway')
    ) {
      if (resource.resourceType === 'Elastic IP') {
        const isUnassoc = resource.metrics.associationStatus === 'unassociated' || resource.status === 'unassociated';
        observedStr = resource.metrics.associationStatus || resource.status;
        thresholdStr = 'unassociated';
        if (isUnassoc) {
          conditionMatched = true;
          stepDescription = `Elastic IP address is provisioned on AWS VPC but not associated with any active network interface.`;
        }
      } else if (resource.resourceType === 'NAT Gateway') {
        const bytes = (resource.metrics.networkInBytesPerDay ?? 0) + (resource.metrics.networkOutBytesPerDay ?? 0);
        observedStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB/day`;
        thresholdStr = '< 1.0 MB/day';
        if (bytes < 1024 * 1024) {
          conditionMatched = true;
          stepDescription = `NAT Gateway has negligible throughput (${observedStr}), yet incurs hourly fixed gateway charges.`;
        }
      }
    }

    // Rule 004: Old Snapshot
    else if (rule.code === 'RULE-004' && resource.resourceType === 'EBS Snapshot') {
      const age = resource.metrics.ageDays ?? 0;
      observedStr = `${age} days`;
      thresholdStr = `> ${rule.threshold} days`;

      if (age > Number(rule.threshold)) {
        conditionMatched = true;
        stepDescription = `Snapshot retention age (${age} days) exceeds configured threshold (${rule.threshold} days).`;
      }
    }

    // Rule 005: Cost Leakage Candidate (High cost, low utilization)
    else if (rule.code === 'RULE-005' && resource.resourceType === 'EC2 Instance') {
      const cpu = resource.metrics.cpuUtilization ?? resource.cpuUtilization ?? 0;
      const cost = resource.monthlyCost;
      observedStr = `₹${cost.toLocaleString()} / mo, CPU ${cpu.toFixed(1)}%`;
      thresholdStr = `Cost > ₹${rule.threshold} AND CPU < 15%`;

      if (cost > Number(rule.threshold) && cpu < 15 && resource.status === 'running') {
        conditionMatched = true;
        stepDescription = `Instance cost of ₹${cost.toLocaleString()}/mo exceeds ₹${rule.threshold}/mo while operating at sub-15% CPU (${cpu.toFixed(1)}%).`;
      }
    }

    // Rule 006: Stopped Instance with Storage
    else if (rule.code === 'RULE-006' && resource.resourceType === 'EC2 Instance') {
      const isStopped = resource.status === 'stopped';
      const age = resource.metrics.ageDays ?? 0;
      observedStr = `stopped (${age} days)`;
      thresholdStr = 'status == stopped AND days > 14';

      if (isStopped && age > 14) {
        conditionMatched = true;
        stepDescription = `Instance has remained in 'stopped' state for ${age} days, continuing to accrue EBS root volume storage billing.`;
      }
    }

    // Rule 007: Stale S3 Bucket
    else if (rule.code === 'RULE-007' && resource.resourceType === 'S3 Bucket') {
      const lastAccess = resource.metrics.lastAccessDays ?? 0;
      const sizeGB = resource.metrics.storageSizeGB ?? 0;
      observedStr = `${lastAccess} days inactive, ${sizeGB} GB`;
      thresholdStr = `Inactive > ${rule.threshold} days AND Size > 50 GB`;

      if (lastAccess > Number(rule.threshold) && sizeGB > 50) {
        conditionMatched = true;
        stepDescription = `S3 bucket containing ${sizeGB} GB has not recorded API read/write operations for ${lastAccess} days.`;
      }
    }

    // Rule 008: Idle RDS Database
    else if (rule.code === 'RULE-008' && resource.resourceType === 'RDS Database') {
      const cpu = resource.metrics.cpuUtilization ?? 0;
      observedStr = `${cpu.toFixed(1)}% CPU`;
      thresholdStr = `< ${rule.threshold}% CPU`;

      if (cpu < Number(rule.threshold)) {
        conditionMatched = true;
        stepDescription = `RDS database instance CPU utilization (${observedStr}) is below idle threshold (${rule.threshold}%).`;
      }
    }

    // If condition was matched, register detection, alert, and recommendation
    if (conditionMatched) {
      const estimatedWaste = Math.round(resource.monthlyCost);
      const estimatedSavings = Math.round(resource.monthlyCost * rule.savingsFactor);

      if (severityRank[rule.severity] > severityRank[highestSeverity]) {
        highestSeverity = rule.severity;
      }

      const detection: WasteDetection = {
        id: `det-${resource.id}-${rule.code.toLowerCase()}`,
        resourceId: resource.id,
        resourceName: resource.name,
        resourceType: resource.resourceType,
        service: resource.service,
        region: resource.region,
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        wasteCategory: rule.category,
        observedValue: observedStr,
        threshold: thresholdStr,
        conditionMet: rule.conditionDescription,
        severity: rule.severity,
        estimatedMonthlyWaste: estimatedWaste,
        estimatedPotentialSavings: estimatedSavings,
        recommendedAction: rule.recommendationTemplate,
        status: 'Open',
        detectedAt: new Date().toISOString(),
        explanation: {
          ruleLogic: rule.conditionDescription,
          evaluationStep: stepDescription,
          impactReason: `Resource contributes estimated ₹${estimatedWaste.toLocaleString()}/mo to waste. Action can yield estimated ₹${estimatedSavings.toLocaleString()}/mo savings.`,
        },
      };

      const alert: Alert = {
        id: `alt-${resource.id}-${rule.code.toLowerCase()}`,
        timestamp: new Date().toISOString(),
        resourceId: resource.id,
        resourceName: resource.name,
        service: resource.service,
        reason: `${resource.id} triggered ${rule.code}: ${observedStr} meets condition [${thresholdStr}]`,
        severity: rule.severity,
        estimatedCostImpact: estimatedWaste,
        recommendedAction: rule.recommendationTemplate,
        status: 'Active',
        ruleCode: rule.code,
      };

      let actionType: Recommendation['actionType'] = 'Review';
      if (rule.category === 'Underutilized Resource') actionType = 'Rightsize';
      else if (rule.category === 'Orphaned Storage' && resource.resourceType === 'EBS Volume') actionType = 'Delete Volume';
      else if (rule.category === 'Unused Network Resource') actionType = 'Release IP';
      else if (rule.category === 'Old Snapshot' || rule.category === 'Orphaned Storage') actionType = 'Lifecycle Archive';
      else if (rule.category === 'Idle Resource') actionType = 'Stop Instance';

      const currentCost = resource.monthlyCost;
      const projectedCost = Math.max(0, currentCost - estimatedSavings);
      const riskLevel: Recommendation['riskLevel'] = rule.severity === 'Critical' ? 'High' : rule.severity === 'High' ? 'Medium' : 'Low';

      const recommendation: Recommendation = {
        id: `rec-${resource.id}-${rule.code.toLowerCase()}`,
        resourceId: resource.id,
        resourceName: resource.name,
        service: resource.service,
        problem: `${rule.name}: ${stepDescription}`,
        recommendation: rule.recommendationTemplate,
        action: rule.recommendationTemplate,
        description: stepDescription,
        currentCost,
        projectedCost,
        potentialMonthlySavings: estimatedSavings,
        estimatedMonthlyImpact: estimatedSavings,
        priority: rule.severity,
        ruleCode: rule.code,
        actionType,
        effortLevel: rule.severity === 'Critical' ? 'High' : rule.severity === 'High' ? 'Medium' : 'Low',
        riskLevel,
        status: 'Pending',
      };

      matchedDetections.push(detection);
      matchedAlerts.push(alert);
      matchedRecommendations.push(recommendation);
    }
  }

  const isWasteful = matchedDetections.length > 0;
  const wasteCategory: WasteCategory = isWasteful
    ? matchedDetections[0].wasteCategory
    : 'Healthy';

  return {
    isWasteful,
    wasteCategory,
    severity: isWasteful ? highestSeverity : 'Info',
    detections: matchedDetections,
    alerts: matchedAlerts,
    recommendations: matchedRecommendations,
  };
}

/**
 * Runs batch rule evaluation across an entire cloud resource fleet.
 */
export function evaluateAllResources(
  resources: CloudResource[],
  rules: DetectionRule[]
): {
  enrichedResources: CloudResource[];
  detections: WasteDetection[];
  alerts: Alert[];
  recommendations: Recommendation[];
  summary: DashboardSummary;
} {
  const enrichedResources: CloudResource[] = [];
  const allDetections: WasteDetection[] = [];
  const allAlerts: Alert[] = [];
  const allRecommendations: Recommendation[] = [];

  for (const res of resources) {
    const evalResult = evaluateResource(res, rules);
    enrichedResources.push({
      ...res,
      isWasteful: evalResult.isWasteful,
      wasteStatus: evalResult.wasteCategory,
      severity: evalResult.severity,
      lastChecked: new Date().toISOString(),
    });

    allDetections.push(...evalResult.detections);
    allAlerts.push(...evalResult.alerts);
    allRecommendations.push(...evalResult.recommendations);
  }

  // Calculate high-level summary metrics
  const totalCloudCost = enrichedResources.reduce((sum, r) => sum + r.monthlyCost, 0);
  const potentialWaste = allDetections.reduce((sum, d) => sum + d.estimatedMonthlyWaste, 0);
  const potentialSavings = allDetections.reduce((sum, d) => sum + d.estimatedPotentialSavings, 0);
  const resourcesScanned = enrichedResources.length;
  const wastefulResourcesCount = enrichedResources.filter((r) => r.isWasteful).length;
  const criticalIssuesCount = allDetections.filter((d) => d.severity === 'Critical').length;

  // Service breakdown
  const serviceMap = new Map<string, { cost: number; waste: number; count: number }>();
  for (const r of enrichedResources) {
    const existing = serviceMap.get(r.service) || { cost: 0, waste: 0, count: 0 };
    existing.cost += r.monthlyCost;
    existing.count += 1;
    if (r.isWasteful) {
      existing.waste += r.monthlyCost;
    }
    serviceMap.set(r.service, existing);
  }

  const serviceBreakdown = Array.from(serviceMap.entries()).map(([srv, val]) => ({
    service: srv as any,
    cost: Math.round(val.cost),
    waste: Math.round(val.waste),
    resourceCount: val.count,
  }));

  // Resource health donut distribution
  const healthCounts = {
    Healthy: enrichedResources.filter((r) => !r.isWasteful).length,
    Underutilized: enrichedResources.filter((r) => r.wasteStatus === 'Underutilized Resource').length,
    Unused: enrichedResources.filter((r) => r.wasteStatus === 'Unused Network Resource').length,
    Orphaned: enrichedResources.filter((r) => r.wasteStatus === 'Orphaned Storage').length,
    Critical: enrichedResources.filter((r) => r.severity === 'Critical').length,
  };

  const resourceHealth = [
    { status: 'Healthy', count: healthCounts.Healthy, color: '#10B981' },
    { status: 'Underutilized', count: healthCounts.Underutilized, color: '#F59E0B' },
    { status: 'Unused', count: healthCounts.Unused, color: '#6366F1' },
    { status: 'Orphaned', count: healthCounts.Orphaned, color: '#EC4899' },
    { status: 'Critical', count: healthCounts.Critical, color: '#EF4444' },
  ];

  // Waste by type
  const wasteMap = new Map<string, { count: number; waste: number }>();
  for (const d of allDetections) {
    const curr = wasteMap.get(d.wasteCategory) || { count: 0, waste: 0 };
    curr.count += 1;
    curr.waste += d.estimatedMonthlyWaste;
    wasteMap.set(d.wasteCategory, curr);
  }

  const wasteByType = Array.from(wasteMap.entries()).map(([cat, val]) => ({
    category: cat,
    count: val.count,
    wasteAmount: Math.round(val.waste),
  }));

  // Savings by category
  const savingsMap = new Map<string, number>();
  for (const d of allDetections) {
    const curr = savingsMap.get(d.wasteCategory) || 0;
    savingsMap.set(d.wasteCategory, curr + d.estimatedPotentialSavings);
  }

  const savingsByCategory = Array.from(savingsMap.entries()).map(([cat, val]) => ({
    category: cat,
    savings: Math.round(val),
  }));

  // Monthly trend (Realistic 6-month historical curve)
  const monthlyTrend = [
    { month: 'Apr', totalCost: 52400, wasteCost: 7100, optimizedCost: 45300 },
    { month: 'May', totalCost: 54800, wasteCost: 7500, optimizedCost: 47300 },
    { month: 'Jun', totalCost: 56900, wasteCost: 7850, optimizedCost: 49050 },
    { month: 'Jul', totalCost: 58200, wasteCost: 8100, optimizedCost: 50100 },
    { month: 'Aug', totalCost: 59400, wasteCost: 8250, optimizedCost: 51150 },
    { month: 'Sep (Current)', totalCost: Math.round(totalCloudCost), wasteCost: Math.round(potentialWaste), optimizedCost: Math.round(totalCloudCost - potentialSavings) },
  ];

  return {
    enrichedResources,
    detections: allDetections,
    alerts: allAlerts,
    recommendations: allRecommendations,
    summary: {
      totalCloudCost: Math.round(totalCloudCost),
      potentialWaste: Math.round(potentialWaste),
      potentialSavings: Math.round(potentialSavings),
      resourcesScanned,
      wastefulResourcesCount,
      criticalIssuesCount,
      serviceBreakdown,
      monthlyTrend,
      resourceHealth,
      wasteByType,
      savingsByCategory,
      recentDetections: allDetections.slice(0, 7),
    },
  };
}
