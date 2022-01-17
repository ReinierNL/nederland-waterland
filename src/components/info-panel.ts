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
      return ([
        properties &&
        m('.info-panel', [
          props &&
            m('table.feature-props', [
              ...Object.keys(props)
                .filter((key) => !properties || properties.hasOwnProperty(key))
                .map((key) => [
                  // perhaps a bit ugly: fields with name 'pdf' are treated differently
                  (key != 'pdf') && m('tr', [
                    m('td.bold.toright', !properties ? key : properties[key].title(key)),
                    m('td', !properties ? props[key] : properties[key].value(props[key])),
                  ]),

                  (key == 'pdf') && props.pdf && m('tr', [
                    m('td.bold.toright', !properties ? key : properties[key].title(key)),
                    m('td', [m(`a#[href='https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/TVW/${props.pdf}']`, 
                    { target: '_blank' },
                    `Download PDF`)]),
                  ])
                ])
            ]),
        ])
      ]);
    },
  };
};
