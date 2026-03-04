export interface AnalysisResult {
  overallScore: number;
  status: 'Pass' | 'Needs Improvement' | 'Fail';
  metrics: {
    functionality: MetricDetail;
    alignment: MetricDetail;
    harmony: MetricDetail;
  };
  heatmapPoints: Array<{ x: number; y: number; intensity: number }>;
  suggestions: Array<{ title: string; description: string; actionable: string }>;
  optimizationPrompt: string;
}

export interface MetricDetail {
  score: number;
  details: string;
  issues?: Array<{
    type: string;
    description: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface HistoryItem {
  id: number;
  image_url: string;
  analysis: AnalysisResult;
  created_at: string;
}
