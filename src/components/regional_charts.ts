import m from 'mithril';
import { MeiosisComponent } from '../services/meiosis';
import { ChartJs } from './chart-js';
import { data_build_years, data_bvo, data_elec, data_gas, elec_per_m2, energy_use_types_for_province, 
         energy_use_types_per_sector, gas_per_m2, total_per_m2 } from './chart_data_utils';


export const RegionalCharts: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { selectedCharts, selectedProvince },
        },
        actions
      },
    }) => {
      console.log(`showing regional charts. selectedCharts = ${selectedCharts}`);
      const { setSelectedProvince } = actions;
      return (
        m('#charts.row.graphs', [
          selectedCharts!.includes('bvo,') && m('.col s12', [
            m(ChartJs, {
              onClick: (label) => {
                console.log(`label: ${label}`),  
                setSelectedProvince(label);
              },
              width: "100px",  // changing this value won't change the width.
              height: "60px",  // relative to the width
              maxHeight: "220px",
              data: data_bvo,
            }), // m(ChartJs)
          ]), // bvo (1)

          selectedCharts!.includes('elec,') && m('.col s12', [
            m(ChartJs, {
              onClick: (label) => {
                console.log(`label: ${label}`),  
                setSelectedProvince(label);
              },
              width: "100px",  // changing this value won't change the width.
              height: "60px",  // relative to the width
              maxHeight: "220px",
              data: data_elec,
            }), // m(ChartJs)
          ]), // elec (2)

          selectedCharts!.includes('gas,') && m('.col s12', [
            m(ChartJs, {
              onClick: (label) => {
                console.log(`label: ${label}`),  
                setSelectedProvince(label);
              },
              width: "100px", 
              height: "60px", 
              maxHeight: "220px",
              data: data_gas,
            }), // m(ChartJs)
          ]), // gas (3)

          selectedCharts!.includes('verdeling,') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              key: selectedProvince,
              width: "100px", 
              height: "60px", 
              maxHeight: "180px",
              data: energy_use_types_for_province(selectedProvince, 2020),
            }), // m(ChartJs)
          ]), // verdeling (4)

          selectedCharts!.includes('gas_per_m2') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              onClick: (label) => {
                console.log(`label: ${label}`),  
                setSelectedProvince(label);
              },
              width: "100px", 
              height: "60px", 
              maxHeight: "220px",
              data: gas_per_m2,
            }), // m(ChartJs)
          ]), // gas_per_m2 (6a)

          selectedCharts!.includes('elec_per_m2') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              onClick: (label) => {
                console.log(`label: ${label}`),  
                setSelectedProvince(label);
              },
              width: "100px", 
              height: "60px", 
              maxHeight: "220px",
              data: elec_per_m2,
            }), // m(ChartJs)
          ]), // gas_per_m2 (6b)

          selectedCharts!.includes('total_per_m2') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              onClick: (label) => {
                console.log(`label: ${label}`),  
                setSelectedProvince(label);
              },
              width: "100px", 
              height: "60px", 
              maxHeight: "220px",
              data: total_per_m2,
            }), // m(ChartJs)
          ]), // gas_per_m2 (6c)

          selectedCharts!.includes('gas_per_sector,') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              key: selectedProvince,
              width: "100px", 
              height: "100px", 
              maxHeight: "280px",
              data: energy_use_types_per_sector(selectedProvince, 'gas'),
            }), // m(ChartJs)
          ]), // gas_per_m2 (7a)

          selectedCharts!.includes('elec_per_sector,') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              key: selectedProvince,
              width: "100px", 
              height: "100px", 
              maxHeight: "280px",
              data: energy_use_types_per_sector(selectedProvince, 'elec'),
            }), // m(ChartJs)
          ]), // gas_per_m2 (7b)

          selectedCharts!.includes('build_years,') && selectedProvince && m('.col s12', [
            m(ChartJs, {
              key: selectedProvince,
              width: "100px", 
              height: "100px", 
              maxHeight: "280px",
              data: data_build_years(),
            }), // m(ChartJs)
          ]), // gas_per_m2 (7b)
  
        ])
      );
    },
  };
};
