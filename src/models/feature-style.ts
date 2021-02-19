import { capitalize } from '../utils';

export const toColorFactory = (layerName: string) => {
  const propertyStyle = propertyStyles[layerName];
  if (!propertyStyle || !propertyStyle.legend) return () => 'blue';
  const items = propertyStyle.legend.items;
  return (value?: number) => {
    if (!value) return items[0][1];
    let min = Number.MIN_VALUE;
    for (let i = 0; i < items.length - 1; i++) {
      if (min < value && value < items[i][0]) return items[i][1];
      min = items[i][0];
    }
    return items[items.length - 1][1];
  };
};

export const propertyStyles = {
  wateren_potentie_gt1ha: {
    legend: {
      items: [
        [0, '#808080', 'Ontbrekende waarde'],
        [5000, '#ffc0c0', 'Tussen 0 en 5.000 GJ'],
        [100000, '#ff9090', 'Tussen 5.000 en 10.000 GJ'],
        [200000, '#ff4040', 'Tussen 10.000 en 20.000 GJ'],
        [Number.MAX_VALUE, '#ff0000', 'Boven 20.000 GJ'],
      ],
      title: 'Water potentie',
    },
    properties: {
      FUNCTIE: {
        title: () => 'Functie',
        value: (s: string) => capitalize(s),
      },
      NAAM: {
        title: () => 'Naam',
        value: (s: string) => s,
      },
      TYPEWATER: {
        title: () => 'Type water',
        value: capitalize,
      },
      VOORKOMENW: {
        title: () => 'Voorkomen',
        value: capitalize,
      },
      AVGwocGJ_1: {
        title: () => 'Potentie',
        value: (n: number) => `${Math.round(n / 1000) * 1000} GJ`,
      },
    },
  },
} as Record<
  string,
  {
    legend?: { items: Array<[number, string, string]>; title: string };
    properties: { [key: string]: { title: (s: string) => string; value: (s: any) => string | number } };
  }
>;
