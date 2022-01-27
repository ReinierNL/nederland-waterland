import m, { FactoryComponent } from 'mithril';
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle,
  ChartConfiguration,
  ChartTypeRegistry,
  ScatterDataPoint,
  BubbleDataPoint,
} from 'chart.js';

import { onChartClick } from './chart_data_utils';

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);


export const ChartJs: FactoryComponent<{
  width?: number|string;
  height?: number|string;
  maxHeight?: number|string;
  onClick?: (label: string) => void;
  data: ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>;
}> = () => {
  let canvas: HTMLCanvasElement;
  let chart: Chart;

  return {
    view: ({ attrs: { width = 300, height = 200, maxHeight = 500 } }) => {

      return m(`canvas.bar-chart`, { style: `width: ${width}; height: ${height}; max-height: ${maxHeight}` });
    },
    oncreate: ({ dom, attrs: { data, onClick } }) => {
      canvas = dom as HTMLCanvasElement;
      if (onClick && data.options) {
        data.options.onClick = onChartClick(onClick);
      }
      chart = new Chart(canvas, data);
    },
  };
};
