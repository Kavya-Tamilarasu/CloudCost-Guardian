import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { repository } from './server/repository';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ===================== REST API ROUTES =====================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CloudCost Guardian Rule-Based Engine',
      version: '1.0.0',
      system: 'Deterministic Explainable Analysis',
      timestamp: new Date().toISOString(),
    });
  });

  // Resources
  app.get('/api/resources', (req: Request, res: Response) => {
    const { service, status, wasteStatus, severity, search } = req.query;
    const resources = repository.getAllResources({
      service: service as string,
      status: status as string,
      wasteStatus: wasteStatus as string,
      severity: severity as string,
      search: search as string,
    });
    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  });

  app.get('/api/resources/:id', (req: Request, res: Response) => {
    const resource = repository.getResourceById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    const detections = repository.getAllDetections().filter((d) => d.resourceId === resource.id);
    const alerts = repository.getAllAlerts().filter((a) => a.resourceId === resource.id);
    const recommendations = repository.getAllRecommendations().filter((r) => r.resourceId === resource.id);

    res.json({
      success: true,
      data: {
        ...resource,
        detections,
        alerts,
        recommendations,
      },
    });
  });

  // Waste Detections
  app.get('/api/waste', (req: Request, res: Response) => {
    const { category, severity } = req.query;
    const detections = repository.getAllDetections(category as string, severity as string);
    res.json({
      success: true,
      count: detections.length,
      data: detections,
    });
  });

  app.get('/api/waste/:id', (req: Request, res: Response) => {
    const detection = repository.getDetectionById(req.params.id);
    if (!detection) {
      return res.status(404).json({ success: false, error: 'Waste detection not found' });
    }
    res.json({ success: true, data: detection });
  });

  // Costs
  app.get('/api/costs', (req: Request, res: Response) => {
    const costData = repository.getCostBreakdown();
    res.json({ success: true, data: costData });
  });

  app.get('/api/costs/summary', (req: Request, res: Response) => {
    const summary = repository.getDashboardSummary();
    res.json({
      success: true,
      data: {
        totalMonthlyCost: summary.totalCloudCost,
        potentialWaste: summary.potentialWaste,
        potentialSavings: summary.potentialSavings,
        serviceBreakdown: summary.serviceBreakdown,
        monthlyTrend: summary.monthlyTrend,
      },
    });
  });

  // Alerts
  app.get('/api/alerts', (req: Request, res: Response) => {
    const { status, severity } = req.query;
    const alerts = repository.getAllAlerts(status as string, severity as string);
    res.json({ success: true, count: alerts.length, data: alerts });
  });

  app.put('/api/alerts/:id', (req: Request, res: Response) => {
    const { status } = req.body;
    if (!['Active', 'Reviewed', 'Dismissed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid alert status' });
    }
    const updated = repository.updateAlertStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: updated });
  });

  // Recommendations
  app.get('/api/recommendations', (req: Request, res: Response) => {
    const recommendations = repository.getAllRecommendations();
    res.json({ success: true, count: recommendations.length, data: recommendations });
  });

  app.put('/api/recommendations/:id', (req: Request, res: Response) => {
    const { status } = req.body;
    if (!['Pending', 'Applied', 'Dismissed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid recommendation status' });
    }
    const updated = repository.updateRecommendationStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }
    res.json({ success: true, data: updated });
  });

  // Rules
  app.get('/api/rules', (req: Request, res: Response) => {
    const rules = repository.getAllRules();
    res.json({ success: true, count: rules.length, data: rules });
  });

  app.get('/api/rules/:id', (req: Request, res: Response) => {
    const rule = repository.getRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: rule });
  });

  app.put('/api/rules/:id', (req: Request, res: Response) => {
    const { enabled, threshold, severity } = req.body;
    const updated = repository.updateRule(req.params.id, { enabled, threshold, severity });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({
      success: true,
      message: 'Rule updated and all resources re-evaluated successfully',
      data: updated,
      summary: repository.getDashboardSummary(),
    });
  });

  app.post('/api/rules/reevaluate', (req: Request, res: Response) => {
    repository.reEvaluate();
    const summary = repository.getDashboardSummary();
    const scanInfo = repository.getLastScanInfo();
    res.json({
      success: true,
      message: 'Deterministic rule evaluation completed across full inventory',
      scanInfo,
      summary,
    });
  });

  // Dashboard Summary
  app.get('/api/dashboard/summary', (req: Request, res: Response) => {
    const summary = repository.getDashboardSummary();
    const scanInfo = repository.getLastScanInfo();
    res.json({
      success: true,
      scanInfo,
      data: summary,
    });
  });

  // Cost Breakdown
  app.get('/api/cost/breakdown', (req: Request, res: Response) => {
    const breakdown = repository.getCostBreakdown();
    res.json({
      success: true,
      data: breakdown,
    });
  });

  // Mock Admin Authentication
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Transparent mock auth for academic demonstration
    if (email && password && password.length >= 4) {
      res.json({
        success: true,
        user: {
          email,
          name: email.split('@')[0] || 'Administrator',
          role: 'Cloud FinOps Administrator',
          isAuthenticated: true,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password. Use demo credentials or password with min 4 characters.',
      });
    }
  });

  // ===================== VITE OR STATIC SERVING =====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudCost Guardian server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
