import m from 'mithril';
import { propertyStyles } from '../models/feature-style';
import { MeiosisComponent } from '../services/meiosis';
import { isCareOrCureLayer } from './utils_rs'

export const Legend: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { selectedLayer },
        },
        actions: { refreshLayer },
      },
    }) => {
      const propertyStyle = selectedLayer && propertyStyles[selectedLayer];
      const legend = propertyStyle && propertyStyle.legend;
      const canUncheckItem = legend && legend.items.reduce((acc, cur) => (acc += cur[0] ? 1 : 0), 0) > 1;
      return (
        !isCareOrCureLayer(selectedLayer!) &&
        legend && legend.items && (legend.items.length > 0) &&
        m('.legend', [
          m('h5', { style: 'margin-bottom: 0;' }, `Legenda ${legend.title}`),
          legend.items.map((item) =>
            m('.legend-item', [
              m('.legend-rectangle', {
                style: `background-color: ${item[2]}`,
              }),
              m('input[type=checkbox].legend-checkbox', {
                disabled: item[0] && !canUncheckItem,
                checked: item[0] ? 'checked' : undefined,
                onclick: () => {
                  item[0] = !item[0];
                  refreshLayer(selectedLayer);
                },
              }),
              m('span', item[3]),
            ])
          ),
        ])
      );
    },
  };
};
