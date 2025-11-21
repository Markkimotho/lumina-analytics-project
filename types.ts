export type DataValue = string | number | boolean | null;

export interface DataPoint {
  [key: string]: DataValue;
}

export interface Dataset {
  id: string;
  name: string;
  data: DataPoint[];
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  createdAt: number;
}

export enum ChartType {
  LINE = 'Line',
  BAR = 'Bar',
  AREA = 'Area',
  SCATTER = 'Scatter',
  PIE = 'Pie',
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  xAxisKey: string;
  yAxisKey: string;
  color: string;
  title: string;
}

export interface AIInsight {
  summary: string;
  trends: string[];
  anomalies: string[];
  recommendation: string;
}

export interface NumericSummary {
  column: string;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  q1: number;
  q3: number;
  nullCount: number;
}

export interface CorrelationResult {
  col1: string;
  col2: string;
  correlation: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  suggestedActions?: {
    label: string;
    action: 'create_chart';
    payload: Partial<ChartConfig>;
  }[];
}