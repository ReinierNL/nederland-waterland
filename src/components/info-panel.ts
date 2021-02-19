import m from 'mithril';
import { propertyStyles } from '../models';
import { MeiosisComponent } from '../services/meiosis';

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
