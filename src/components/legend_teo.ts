import m from 'mithril';
import { propertyStyles } from '../models/feature-style';
import { MeiosisComponent } from '../services/meiosis';

export const Legend_teo: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { wateren_potentie_gt1haLayer },
        },
        actions: { refreshLayer },
      },
    }) => {
      // console.log('getting legend (TEO)');
      // selectedLayer && console.log('selectedLayer: ', selectedLayer);
      const layerName = wateren_potentie_gt1haLayer!.options.name;
      // console.log('TEO layer.name: ', wateren_potentie_gt1haLayer!.options.name);
      const propertyStyle = layerName && propertyStyles[layerName];
      const legend = propertyStyle && propertyStyle.legend;
      // console.log('legend:', legend);
      // if (legend && legend.title) { console.log(`legend.title: ${legend.title}`) };
      const canUncheckItem = legend && legend.items.reduce((acc, cur) => (acc += cur[0] ? 1 : 0), 0) > 1;
      return (
        legend && m('.legend', [
          legend && legend.title && m('b', `Legenda ${legend.title}`),
          legend && legend.items && (legend.items.length > 0) && 
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
                  refreshLayer(layerName);
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
