import m from 'mithril';
import { propertyStyles } from '../models';
import { MeiosisComponent } from '../services/meiosis';

import layerTitles from '../assets/layerTitles.json';

export const HospitalInfoPanel: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { selectedHospital },
        },
      },
    }) => {
      const selectedHospitalLayer = 'hospitals'
      const props = selectedHospital && selectedHospital.properties;
      const propStyle = selectedHospitalLayer && propertyStyles[selectedHospitalLayer];
      const properties = propStyle && propStyle.properties;
      return m('.hospital-info-panel', [
        selectedHospitalLayer && m('h4.title', `Geselecteerd: ${layerTitles[selectedHospitalLayer] || selectedHospitalLayer}`),
        props &&
          m('table.feature-props', [
            ...Object.keys(props)
              .filter((key) => !properties || properties.hasOwnProperty(key))
              .map((key) =>
                m('tr', [
                  m('td.bold.toright', !properties ? key : properties[key].title(key)),
                  m('td', !properties ? props[key] : properties[key].value(props[key])),
                ])
              ),
          ]),
      ]);
    },
  };
};
