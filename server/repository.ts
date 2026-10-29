import {
  CloudResource,
  DetectionRule,
  WasteDetection,
  Alert,
  Recommendation,
  DashboardSummary,
  AlertStatus,
} from '../src/types/cloud';
import { DEFAULT_RULES, evaluateAllResources } from '../src/engine/ruleEngine';
import { INITIAL_RESOURCES } from './mockData';

class CloudCostRepository {
  private resources: CloudResource[] = [];
  private rules: DetectionRule[] = [];
  private detections: WasteDetection[] = [];
  private alerts: Alert[] = [];
  private recommendations: Recommendation[] = [];
  private summary: DashboardSummary | null = null;
  private lastScanTimestamp: string = new Date().toISOString();

  constructor() {
    this.resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
    this.rules = JSON.parse(JSON.stringify(DEFAULT_RULES));
    this.reEvaluate();
  }

  /**
   * Re-evaluates all resources against active rules using the deterministic rule engine.
   */
  public reEvaluate(): void {
    const result = evaluateAllResources(this.resources, this.rules);
    this.resources = result.enrichedResources;
    this.detections = result.detections;
    this.alerts = result.alerts;
    this.recommendations = result.recommendations;
    this.summary = result.summary;
    this.lastScanTimestamp = new Date().toISOString();
  }

  public getAllResources(filters?: {
    service?: string;
    status?: string;
    wasteStatus?: string;
    severity?: string;
    search?: string;
  }): CloudResource[] {
    let result = [...this.resources];

    if (filters?.service && filters.service !== 'ALL') {
      result = result.filter((r) => r.service.toLowerCase() === filters.service?.toLowerCase());
    }

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.wasteStatus && filters.wasteStatus !== 'ALL') {
      result = result.filter((r) => r.wasteStatus.toLowerCase() === filters.wasteStatus?.toLowerCase());
    }

    if (filters?.severity && filters.severity !== 'ALL') {
      result = result.filter((r) => r.severity.toLowerCase() === filters.severity?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q) ||
          (r.instanceType && r.instanceType.toLowerCase().includes(q))
      );
    }

    return result;
  }

  public getResourceById(id: string): CloudResource | undefined {
    return this.resources.find((r) => r.id.toLowerCase() === id.toLowerCase());
  }

  public getAllDetections(category?: string, severity?: string): WasteDetection[] {
    let result = [...this.detections];
    if (category && category !== 'ALL') {
      result = result.filter((d) => d.wasteCategory.toLowerCase() === category.toLowerCase());
    }
    if (severity && severity !== 'ALL') {
      result = result.filter((d) => d.severity.toLowerCase() === severity.toLowerCase());
    }
    return result;
  }

  public getDetectionById(id: string): WasteDetection | undefined {
    return this.detections.find((d) => d.id === id);
  }

  public getAllAlerts(status?: string, severity?: string): Alert[] {
    let result = [...this.alerts];
    if (status && status !== 'ALL') {
      result = result.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }
    if (severity && severity !== 'ALL') {
      result = result.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
    }
    return result;
  }

  public updateAlertStatus(id: string, status: AlertStatus): Alert | undefined {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = status;
    }
    return alert;
  }

  public getAllRecommendations(): Recommendation[] {
    return [...this.recommendations];
  }

  public updateRecommendationStatus(id: string, status: 'Pending' | 'Applied' | 'Dismissed'): Recommendation | undefined {
    const rec = this.recommendations.find((r) => r.id === id);
    if (rec) {
      rec.status = status;
    }
    return rec;
  }

  public getAllRules(): DetectionRule[] {
    return [...this.rules];
  }

  public getRuleById(id: string): DetectionRule | undefined {
    return this.rules.find((r) => r.id === id || r.code === id);
  }

  public updateRule(
    id: string,
    updates: Partial<Pick<DetectionRule, 'enabled' | 'threshold' | 'severity'>>
  ): DetectionRule | undefined {
    const rule = this.rules.find((r) => r.id === id || r.code === id);
    if (rule) {
      if (typeof updates.enabled === 'boolean') rule.enabled = updates.enabled;
      if (updates.threshold !== undefined) rule.threshold = updates.threshold;
      if (updates.severity) rule.severity = updates.severity;
      // Re-evaluate automatically to keep consistency
      this.reEvaluate();
    }
    return rule;
  }

  public getDashboardSummary(): DashboardSummary {
    if (!this.summary) {
      this.reEvaluate();
    }
    return this.summary!;
  }

  public getLastScanInfo(): { timestamp: string; count: number } {
    return {
      timestamp: this.lastScanTimestamp,
      count: this.resources.length,
    };
  }

  public getCostBreakdown() {
    const summary = this.getDashboardSummary();
    const resourceCostTable = this.resources.map((r) => {
      const detection = this.detections.find((d) => d.resourceId === r.id);
      return {
        id: r.id,
        name: r.name,
        service: r.service,
        region: r.region,
        monthlyCost: r.monthlyCost,
        utilization: r.cpuUtilization ? `${r.cpuUtilization}% CPU` : r.metrics.storageSizeGB ? `${r.metrics.storageSizeGB} GB` : r.status,
        potentialWaste: detection ? detection.estimatedMonthlyWaste : 0,
        potentialSavings: detection ? detection.estimatedPotentialSavings : 0,
        wasteCategory: r.wasteStatus,
        severity: r.severity,
      };
    });

    return {
      totalMonthlyCost: summary.totalCloudCost,
      potentialWaste: summary.potentialWaste,
      potentialSavings: summary.potentialSavings,
      serviceBreakdown: summary.serviceBreakdown,
      monthlyTrend: summary.monthlyTrend,
      topExpensiveResources: [...resourceCostTable].sort((a, b) => b.monthlyCost - a.monthlyCost).slice(0, 5),
      allResources: resourceCostTable,
    };
  }
}

export const repository = new CloudCostRepository();
