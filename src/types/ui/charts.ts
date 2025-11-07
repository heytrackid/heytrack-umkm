export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
}

export interface LineChartOptions extends ChartOptions {
  showGrid?: boolean;
  showLegend?: boolean;
  curveType?: 'linear' | 'monotoneX' | 'natural' | 'step';
}

export interface BarChartOptions extends ChartOptions {
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export interface PieChartOptions extends ChartOptions {
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}