import m from 'mithril';
import { propertyStyles } from '../models';
import { MeiosisComponent } from '../services/meiosis';

import layerTitles from '../assets/layerTitles.json';

export const InfoPanel: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { selectedItem, selectedLayer },
        },
      },
    }) => {
      const props = selectedItem && selectedItem.properties;
      const propStyle = selectedLayer && propertyStyles[selectedLayer];
      const properties = propStyle && propStyle.properties;
      return m('.info-panel', [
        selectedLayer && m('h4.title', `Geselecteerd: ${layerTitles[selectedLayer] || selectedLayer}`),
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
