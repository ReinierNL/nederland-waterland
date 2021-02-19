import { Feature } from 'geojson';
import { capitalize } from '../utils';

export const toColorFactory = (layerName: string, legendPropName: string): ((f?: Feature) => string) => {
  const propertyStyle = propertyStyles[layerName];
  if (!propertyStyle || !propertyStyle.legend) return () => 'blue';
  const items = propertyStyle.legend.items;
  return (f?: Feature) => {
    const value = f && f.properties ? f.properties[legendPropName] : undefined;
    if (!value) return items[0][2];
    let min = Number.MIN_VALUE;
    for (let i = 0; i < items.length - 1; i++) {
      if (min < value && value < items[i][1]) return items[i][2];
      min = items[i][1];
    }
    return items[items.length - 1][2];
  };
};

export const toFilterFactory = (layerName: string, legendPropName: string): ((f?: Feature) => boolean) => {
  const propertyStyle = propertyStyles[layerName];
  if (!propertyStyle || !propertyStyle.legend) return () => true;
  const items = propertyStyle.legend.items;
  return (f?: Feature) => {
    const value = f && f.properties ? f.properties[legendPropName] : undefined;
    let min = Number.MIN_VALUE;
    for (let i = 0; i < items.length - 1; i++) {
      if (min < value && value < items[i][1]) return items[i][0];
      min = items[i][1];
    }
    return items[items.length - 1][0];
  };
};

export const propertyStyles = {
  wateren_potentie_gt1ha: {
    legend: {
      items: [
        [true, 0, '#808080', 'Ontbrekende waarde'],
        [true, 5000, '#ffc0c0', 'Tussen 0 en 5.000 GJ'],
        [true, 100000, '#ff9090', 'Tussen 5.000 en 10.000 GJ'],
        [true, 200000, '#ff4040', 'Tussen 10.000 en 20.000 GJ'],
        [true, Number.MAX_VALUE, '#ff0000', 'Boven 20.000 GJ'],
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
    legend?: { items: Array<[active: boolean, max: number, color: string, title: string]>; title: string };
    properties: { [key: string]: { title: (s: string) => string; value: (s: any) => string | number } };
  }
>;
