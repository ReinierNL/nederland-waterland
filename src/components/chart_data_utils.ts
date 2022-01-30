import chartdata from '../data/chartdata.json';
const { bvo, elec, gas, kWh_2020, kWh_2030, cons_per_bvo, cons_per_sector, bvo_per_year_category } = chartdata

import { BubbleDataPoint, Chart, ChartConfiguration, ChartEvent, ChartTypeRegistry, ScatterDataPoint } from 'chart.js';
import 'chart.js-plugin-labels-dv';


// some constants and fuctions to follow DRY rule
const rgb2020 = '68, 114, 196';
const rgb2030 = '237, 125, 49';
const rgbLightGreen = '140, 197, 64';
const rgbLightRed = '241, 89, 42';
const rgbLightBlue = '9, 179, 205';

const rgbYears1 = '68, 114, 196';
const rgbYears2 = '237, 125, 49';
const rgbYears3 = '165, 165, 165';
const rgbYears4 = '255, 192, 0';
const rgbYears5 = '91, 155, 213';
const rgbYears6 = '112, 173, 71';
const rgbYears7 = '38, 68, 120';

const optScalesY = (titleY: string) => {
  let opt = {
    scales: {
      y: { 
        beginAtZero: true,
        title: { 
          display: true, 
          text: titleY 
        }
      }
    },
    plugins: {
      labels: {    
        render: () => { return '' }   // show no labels
      }
    }
  }
  return opt
}; // optScalesY

export const onChartClick = (onClick: (label: string) => void) => (event: ChartEvent, _elements: any, myChart: Chart) => {
  const points = myChart.getElementsAtEventForMode(event as unknown as MouseEvent, 'nearest', { intersect: true }, true);

  if (points.length && myChart.data.labels) {
      const firstPoint = points[0];
      const label = myChart.data.labels[firstPoint.index] as string;
      // const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
      // console.table({ points, label, value })
      onClick(label);
  }
} // onChartClick

// charts. In the same order as in Joachim's spreadsheet

export const data_bvo = {
// Chart 1
  type: 'bar',
  data: {
    labels: bvo.labels,
    datasets: [
      {
        label: '2020',
        data: bvo.values2020.map((x: number) => x / 1e6),
        backgroundColor: `rgba(${rgb2020}, 0.5)`,
        borderColor: `rgba(${rgb2020}, 1)`,
        borderWidth: 2,
      },
      {
        label: '2030',
        data: bvo.values2030.map((x: number) => x / 1e6),
        backgroundColor: `rgba(${rgb2030}, 0.5)`,
        borderColor: `rgba(${rgb2030}, 1)`,
        borderWidth: 2,
      },
    ],
  }, // data
  options: optScalesY('BVO oppervlakte / km2'),
} as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // data_bvo (1)


export const data_elec = {
// Chart 2
  type: 'bar',
  data: {
    labels: elec.labels,
    datasets: [
      {
        label: '2020',
        data: elec.values2020.map((x: number) => x / 1e6),
        backgroundColor: `rgba(${rgb2020}, 0.5)`,
        borderColor: `rgba(${rgb2020}, 1)`,
        borderWidth: 2,
      },
      {
        label: '2030',
        data: elec.values2030.map((x: number) => x / 1e6),
        backgroundColor: `rgba(${rgb2030}, 0.5)`,
        borderColor: `rgba(${rgb2030}, 1)`,
        borderWidth: 2,
      },
    ],
  }, // data
  options: optScalesY('Electriciteitsverbruik / GWh'),
} as ChartConfiguration<keyof ChartTypeRegistry>
; // data_elec (2)
  

export const data_gas = {
// Chart 3
type: 'bar',
  data: {
    labels: gas['labels'],
    datasets: [
      {
        label: '2020',
        data: gas.values2020.map((x: number) => x / 1e6),
        backgroundColor: `rgba(${rgb2020}, 0.5)`,
        borderColor: `rgba(${rgb2020}, 1)`,
        borderWidth: 2,
      },
      {
        label: '2030',
        data: gas.values2030.map((x: number) => x / 1e6),
        backgroundColor: `rgba(${rgb2030}, 0.5)`,
        borderColor: `rgba(${rgb2030}, 1)`,
        borderWidth: 2,
      },
    ],
  },
  options: optScalesY('Gasverbruik / M m3'),
} as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // data_gas (3)


const data_energy_use_types = {
// for chart 4
  type: 'pie',
  data: {
    labels: ['gas', 'electriciteit', 'warmte'],
    datasets: [
      {
        data: [ kWh_2020['gas'][1], kWh_2020['elec'][1], kWh_2020['heat'][1] ],
        backgroundColor: [`rgba(${rgbLightGreen}, 0.5)`, `rgba(${rgbLightBlue}, 0.5)`, `rgba(${rgbLightRed}, 0.5)`],
        borderColor: [`rgba(${rgbLightGreen}, 1)`, `rgba(${rgbLightBlue}, 1)`, `rgba(${rgbLightRed}, 1)`],
        borderWidth: 2,
      },
    ],
  }, // data
  options: {
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
} // data_energy_use_types (4)
  
  
export const energy_use_types_for_province = (province: string, year: number) => {
// Chart 4
  var chartdata = data_energy_use_types;
  chartdata.options.plugins.title.text = `Energieverdeling in ${province} ${year}`;
  const kWh_data = year == 2020 ? kWh_2020 : kWh_2030
  var i = kWh_data['labels'].indexOf(province)
  var data_values = [ kWh_data['gas'][i], kWh_data['elec'][i], kWh_data['heat'][i] ]
  chartdata.data.datasets[0].data = data_values
  return chartdata as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
}; // energy_use_types_for_province (4)


export const gas_per_m2 = {
  // Chart 6 - gas
  type: 'bar',
    data: {
      labels: cons_per_bvo['labels'],
      datasets: [
        {
          label: '2020',
          data: cons_per_bvo.values1,
          backgroundColor: `rgba(${rgb2020}, 0.5)`,
          borderColor: `rgba(${rgb2020}, 1)`,
          borderWidth: 2,
        },
        {
          label: '2030',
          data: cons_per_bvo.values2,
          backgroundColor: `rgba(${rgb2030}, 0.5)`,
          borderColor: `rgba(${rgb2030}, 1)`,
          borderWidth: 2,
        },
      ],
    },
    options: optScalesY('Gasverbruik / BVO  (m3 / m2)'),
  } as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // gas_per_m2 (6a)
  
  
export const elec_per_m2 = {
  // Chart 6 - electricity
  type: 'bar',
    data: {
      labels: cons_per_bvo['labels'],
      datasets: [
        {
          label: '2020',
          data: cons_per_bvo.values3,
          backgroundColor: `rgba(${rgb2020}, 0.5)`,
          borderColor: `rgba(${rgb2020}, 1)`,
          borderWidth: 2,
        },
        {
          label: '2030',
          data: cons_per_bvo.values4,
          backgroundColor: `rgba(${rgb2030}, 0.5)`,
          borderColor: `rgba(${rgb2030}, 1)`,
          borderWidth: 2,
        },
      ],
    },
    options: optScalesY('Elec.verbruik / BVO  (kWh / m2)'),
  } as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // elec_per_m2 (6b)
  
  
export const total_per_m2 = {
  // Chart 6 - total
  type: 'bar',
    data: {
      labels: cons_per_bvo['labels'],
      datasets: [
        {
          label: '2020',
          data: cons_per_bvo.values5,
          backgroundColor: `rgba(${rgb2020}, 0.5)`,
          borderColor: `rgba(${rgb2020}, 1)`,
          borderWidth: 2,
        },
        {
          label: '2030',
          data: cons_per_bvo.values6,
          backgroundColor: `rgba(${rgb2030}, 0.5)`,
          borderColor: `rgba(${rgb2030}, 1)`,
          borderWidth: 2,
        },
      ],
    },
    options: optScalesY('Totaal verbruik / BVO  (kWh / m2)'),
  } as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // total_per_m2 (6c)


const data_energy_use_for_sectors = {
// for chart 7
  type: 'pie',
  data: {
    datasets: [
      {
        label: 'Portefeuilleroutekaarten',
        data: [1, 9],  // dummy data
        backgroundColor: [`rgba(${rgbLightRed}, 0.5)`, 'white'],
        borderColor: [`rgba(${rgbLightRed}, 1)`, 'white'],
        borderWidth: 2,
      },
      {
        label: 'Gezondheids- en welzijnszorg',
        data: [3, 7],  // dummy data
        backgroundColor: [`rgba(${rgbLightGreen}, 0.5)`, 'white'],
        borderColor: [`rgba(${rgbLightGreen}, 1)`, 'white'],
        borderWidth: 2,
      },
      {
        label: 'Gebouwde omgeving',
        data: [10, 0],  // dummy data
        backgroundColor: [`rgba(${rgbLightBlue}, 0.5)`, 'white'],
        borderColor: [`rgba(${rgbLightBlue}, 1)`, 'white'],
        borderWidth: 2,
      },
    ],
  }, // data
  options: {
    plugins: {
      labels: {
        render: (args: any) => {
          if (args.index < 1) {
            return `${args.dataset.label}: ${args.percentage} %`
          } else {
            return ''
          }
        }
      },
      title: {
        display: true,
        text: 'Energieverdeling per sector',
        padding: {
          top: 10,
          bottom: 10,
        }
      }
    },
  }, // options
} // data_energy_use_for_sectors (7)


export const energy_use_types_per_sector = (province: string, energykind: string) => {
// Chart 7 (a and b)
  var chartdata = data_energy_use_for_sectors;
  chartdata.options.plugins.title.text = energykind === 'gas' ? `Gasverbruik ${province}` : `Electriciteitsverbruik ${province}` ;
  var i = cons_per_sector['labels'].indexOf(province);
  const datavalues = energykind === 'gas' ? [cons_per_sector.values1, cons_per_sector.values2, cons_per_sector.values3] 
                                          : [cons_per_sector.values4, cons_per_sector.values5, cons_per_sector.values6] 
  chartdata.data.datasets[0].data = [datavalues[0][i], datavalues[2][i] - datavalues[0][i]];
  chartdata.data.datasets[1].data = [datavalues[1][i], datavalues[2][i] - datavalues[0][i]];
  chartdata.data.datasets[2].data = [datavalues[2][i], 0];
  return chartdata as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
}; // energy_use_types_per_sector (7) (a and b)


export const data_build_years_for_chart8 = {
// for Chart 8
  type: 'bar',
  data: {
    labels: bvo_per_year_category.labels,
    datasets: [
      {
        label: 'voor 1990',
        data: bvo_per_year_category.values1,
        backgroundColor: `rgba(${rgbYears1}, 1)`,
        borderColor: `rgba(${rgbYears1}, 1)`,
        borderWidth: 0,
      },
      {
        label: '1990 - 1994',
        data: bvo_per_year_category.values2,
        backgroundColor: `rgba(${rgbYears2}, 1)`,
        borderColor: `rgba(${rgbYears2}, 1)`,
        borderWidth: 0,
      },
      {
        label: '1995 - 1999',
        data: bvo_per_year_category.values3,
        backgroundColor: `rgba(${rgbYears3}, 1)`,
        borderColor: `rgba(${rgbYears3}, 1)`,
        borderWidth: 0,
      },
      {
        label: '2000 - 2002',
        data: bvo_per_year_category.values4,
        backgroundColor: `rgba(${rgbYears4}, 0.9)`,
        borderColor: `rgba(${rgbYears4}, 1)`,
        borderWidth: 0,
      },
      {
        label: '2002 - 2008',
        data: bvo_per_year_category.values5,
        backgroundColor: `rgba(${rgbYears5}, 0.9)`,
        borderColor: `rgba(${rgbYears5}, 1)`,
        borderWidth: 0,
      },
      {
        label: '2009 - 2014',
        data: bvo_per_year_category.values6,
        backgroundColor: `rgba(${rgbYears6}, 0.9)`,
        borderColor: `rgba(${rgbYears6}, 1)`,
        borderWidth: 0,
      },
      {
        label: '2015 en later',
        data: bvo_per_year_category.values7,
        backgroundColor: `rgba(${rgbYears7}, 0.9)`,
        borderColor: `rgba(${rgbYears7}, 1)`,
        borderWidth: 0,
      },
    ],
  }, // data
  options: {
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: {
      labels: {    
        render: () => { return '' }   // show no labels
      }
    }
  }
} as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
; // data_data_build_years (8)
  

export const data_build_years = () => {
// Chart 8
  var chartdata = data_build_years_for_chart8;
  if (chartdata && chartdata.data && chartdata.data.labels) {
    for (var iProvince = 0; iProvince < chartdata.data.labels.length; iProvince++) {
      let sum = 0;
      for (var iDataset = 0; iDataset < chartdata.data.datasets.length; iDataset++) {
        sum += chartdata.data.datasets[iDataset].data[iProvince] as number
      }
      for (var iDataset = 0; iDataset < chartdata.data.datasets.length; iDataset++) {
        chartdata.data.datasets[iDataset].data[iProvince] *= 1/sum
      }
    }
  };
  return chartdata as ChartConfiguration<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>
}; // data_build_years (8)