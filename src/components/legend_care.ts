import m from 'mithril';
import { propertyStyles } from '../models/feature-style';
import { MeiosisComponent } from '../services/meiosis';

export const Legend_care: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { selectedLayer },
        },
      },
    }) => {
      const propertyStyle = selectedLayer && propertyStyles[selectedLayer];
      const legend = propertyStyle && propertyStyle.legend;
      return (
        legend && m('.legend', [
          m('h5', { style: 'margin-bottom: 0;' }, `Legenda ${legend.title}`),
          legend.items.map((item) =>
            m('.legend-item', [
              m('.legend-circle1', {style: `background-color: ${item[0]}`}, [
                m('.legend-circle2', {style: `background-color: ${item[1]}`}, [
                  m('.legend-circle3', {style: `background-color: ${item[2]}`}, [
                    m('.legend-circle4', {style: `background-color: ${item[3]}`}, [
                    ])
                  ])
                ]),
              ]),
              m('span', {style: `height: 20px; vertical-align: middle; margin-left: 8px`}, item[4]),    /* the item label */
            ])
          ),
        ])
      );
    },
  };
};
