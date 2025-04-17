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
        actions: { updateActiveLayers },
      },
    }) => {
      const propertyStyle = selectedLayer && propertyStyles[selectedLayer];
      const legend = propertyStyle && propertyStyle.legend;
      return (
        legend && m('.legend', [
          m('h5', { style: 'margin-bottom: 10;' }, `Legenda ${legend.title}`),
          legend.items.map((item) =>
            m('.legend-item', [
              m('input[type=checkbox].legend-checkbox', {
                checked: item[5] ? 'checked' : undefined,
                onclick: () => {
                  item[5] = !item[5];
                  updateActiveLayers(selectedLayer, false);
                },
              }),
              m('.legend-circle1', {style: `background-color: ${item[0]}`}, [
                m('.legend-circle2', {style: `background-color: ${item[1]}`}, [
                  m('.legend-circle3', {style: `background-color: ${item[2]}`}, [
                    m('.legend-circle4', {style: `background-color: ${item[3]}`}, [
                    ])
                  ])
                ]),
              ]),
              //m('.legend-circle-item', item[4]),    /* the item label */
              m('span', {style: 'vertical-align: top; margin-left: 5px;'}, item[4]),    /* the item label */
            ])
          ),

          m('div', [
            m('text', { style: 'font-size: 0.75em' }, 'Voor toelichting, zie '),
            m("a#[href='https://www.expertisecentrumverduurzamingzorg.nl/goedopdekaart']", 
              { style: 'font-size: 0.75em' }, 'de EVZ website'),
          ])
        ])
      );
    },
  };
};
