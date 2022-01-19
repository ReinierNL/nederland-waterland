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
  data: ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>;
}> = () => {
  let canvas: HTMLCanvasElement;
  let chart: Chart;

  return {
    view: ({ attrs: { width = 600, height = 400 } }) => {
      return m(`canvas.pie-chart[width=${width}][height=${height}]`);
    },
    oncreate: ({ dom, attrs: { data } }) => {
      canvas = dom as HTMLCanvasElement;
      chart = new Chart(canvas, data);
    },
  };
};
