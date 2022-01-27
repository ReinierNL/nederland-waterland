

import chartdata from '../data/chartdata.json';
const { bvo, elec, gas, kWh_2020, kWh_2030, cons_per_bvo, cons_per_sector, bvo_per_year_category } = chartdata

import { BubbleDataPoint,  Chart, ChartConfiguration, ChartEvent, ChartTypeRegistry, ScatterDataPoint } from 'chart.js';


const rgb2020 = '68, 114, 196'
const rgb2030 = '237, 125, 49'


export const data_bvo = {
  type: 'bar',
  data: {
    labels: provincies,
    datasets: [
      {
        label: 'BVO oppervlakte 2020',
        data: sum_of_bvo_2020,
        backgroundColor: `rgba(${rgb2020}, 0.5)`,
        borderColor: `rgba(${rgb2020}, 1)`,
        borderWidth: 2,
      },
      {
        label: 'BVO oppervlakte 2030',
        data: sum_of_bvo_2030,
        backgroundColor: `rgba(${rgb2030}, 0.5)`,
        borderColor: `rgba(${rgb2030}, 1)`,
        borderWidth: 2,
      },
    ],
  }, // data
  options: oBeginAtZero,
}; // data_bvo

export const data_elec = {
  type: 'bar',
  data: {
    labels: provincies,
    datasets: [
      {
        label: 'Electriciteitsverbruik 2020',
        data: elec_2020,
        backgroundColor: `rgba(${rgb2020}, 0.5)`,
        borderColor: `rgba(${rgb2020}, 1)`,
        borderWidth: 2,
      },
      {
        label: 'Electriciteitsverbruik 2030',
        data: elec_2030,
        backgroundColor: `rgba(${rgb2030}, 0.5)`,
        borderColor: `rgba(${rgb2030}, 1)`,
        borderWidth: 2,
      },
    ],
  }, // data
  options: oBeginAtZero,
}; // data_elec
  

export const data_gas = {
  type: 'bar',
  data: {
    labels: gas['labels'],
    datasets: [
      {
        label: 'Gasverbruik 2020',
        data: gas['values2020'],
        backgroundColor: `rgba(${rgb2020}, 0.5)`,
        borderColor: `rgba(${rgb2020}, 1)`,
        borderWidth: 2,
      },
      {
        label: 'Gasverbruik 2030',
        data: gas['values2030'],
        backgroundColor: `rgba(${rgb2030}, 0.5)`,
        borderColor: `rgba(${rgb2030}, 1)`,
        borderWidth: 2,
      },
    ],
  },
  options: oBeginAtZero,
} as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // data_gas


export const onChartClick = (onClick: (label: string) => void) => (event: ChartEvent, _elements: any, myChart: Chart) => {
    const points = myChart.getElementsAtEventForMode(event as unknown as MouseEvent, 'nearest', { intersect: true }, true);

    if (points.length && myChart.data.labels) {
        const firstPoint = points[0];
        const label = myChart.data.labels[firstPoint.index] as string;
        // const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
        // console.table({ points, label, value })
        onClick(label);
    }
}

const data_energy_use_types = {
  type: 'pie',
  data: {
    labels: ['gas', 'electriciteit', 'warmte'],
    datasets: [
      {
        data: [ kWh_2020['gas'][1], kWh_2020['elec'][1], kWh_2020['heat'][1] ],
        backgroundColor: ['green', 'blue', 'red'],
        borderColor: ['green', 'blue', 'red'],
        borderWidth: 2,
      },
    ],
  }, // data
  options: {
    //   onChartClick: onChartClick('chartName'),
    plugins: {
        title: {
            display: true,
            text: 'Energieverdeling in Flevoland 2020',
            padding: {
                top: 10,
                bottom: 10,
            }
        }
    },
  },
} // data_energy_use_types


export const energy_use_types_for_province = (province: string, year: number) => {
  var chartdata = data_energy_use_types;
  chartdata.options.plugins.title.text = `Energieverdeling in ${province} ${year}`;
  const kWh_data = year == 2020 ? kWh_2020 : kWh_2030
  var i = kWh_data['labels'].indexOf(province)
  var data_values = [ kWh_data['gas'][i], kWh_data['elec'][i], kWh_data['heat'][i] ]
  chartdata.data.datasets[0].data = data_values
  return chartdata
}