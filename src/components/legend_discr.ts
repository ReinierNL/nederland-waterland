import m from 'mithril';
import { propertyStyles } from '../models/feature-style';
import { MeiosisComponent } from '../services/meiosis';

export const Legend_discr: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { selectedLayer },
        },
      },
    }) => {
      console.log('getting discretelegend');
      selectedLayer && console.log('selectedLayer: ', selectedLayer);
      const propertyStyle = selectedLayer && propertyStyles[selectedLayer];
      const legend = propertyStyle && propertyStyle.discretelegend;
      console.log('discretelegend:', legend);
      if (legend && legend.title) { console.log(`legend.title: ${legend.title}`) };
      return (
        legend && (legend.title != 'no legend') && m('.legend', [
          legend && legend.title && m('b', `Legenda ${legend.title}`),

          legend && legend.items && (legend.items.length > 0) && 
          legend.items.map((item) =>
            m('.legend-item', [
              m('.legend-rectangle', {
                style: `background-color: ${item[1]}`,
              }),
              m('span', item[2]),
            ])
          ),
        ])
      );
    },
  };
};
