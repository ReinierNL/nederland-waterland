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
        actions: { refreshLayer },
      },
    }) => {
      console.log('getting legend (ziekenhuizen)');
      // selectedLayer && console.log('selectedLayer: ', selectedLayer);
      const layerName = selectedLayer;
      // console.log('layerName: ', layerName);
      const propertyStyle = selectedLayer && propertyStyles[selectedLayer];
      const legend = propertyStyle && propertyStyle.legend;
      // console.log('legend:', legend);
      // if (legend && legend.title) { console.log(`legend.title: ${legend.title}`) };
      const canUncheckItem = legend && legend.items.reduce((acc, cur) => (acc += cur[0] ? 1 : 0), 0) > 1;
      return (
        legend && m('.legend', [
          m('h5', { style: 'margin-bottom: 10;' }, `Legenda ${legend.title}`),
          legend && legend.items && (legend.items.length > 0) && 
          legend.items.map((item) =>
            m('.legend-item', [
              m('.legend-circle', {
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
              m('.legend-circle-item', item[3]),
            ])
          ),
        ])
      );
    },
  };
};
