import m from 'mithril';
import { propertyStyles } from '../models';
import { MeiosisComponent } from '../services/meiosis';

import layerTitles from '../assets/layerTitles.json';

const space = '&nbsp;'

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
        // m('p', space),   // attempted to add some space between previous content and organisation and this panel
        selectedLayer &&
          m('h4', 'Geselecteerd: ' + layerTitles[selectedLayer]),
        props &&
          properties &&
          m('table.feature-props', [
            ...Object.keys(props)
              .filter((key) => properties.hasOwnProperty(key))
              .map((key) =>
                m('tr', [m('td.bold.toright', properties[key].title(key)), m('td', properties[key].value(props[key]))])
              ),
          ]),
      ]);
    },
  };
};
