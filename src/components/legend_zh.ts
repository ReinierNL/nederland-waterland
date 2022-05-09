import m from 'mithril';
import { propertyStyles } from '../models/feature-style';
import { MeiosisComponent } from '../services/meiosis';

export const Legend_zh: MeiosisComponent = () => {
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
          m('h5', { style: 'margin-bottom: 10;' }, `Legenda ${legend.title}`),
          legend.items.map((item) =>
            m('.legend-item', [
              m('.legend-circle', {
                style: `background-color: ${item[2]}`,
              }),
              m('.legend-circle-item', item[3]),
            ])
          ),
        ])
      );
    },
  };
};
