import { Feature } from 'geojson';
import { capitalize } from '../utils';
import rk_legend from '../assets/rk_legend.json'

export const toColorFactory = (layerName: string, legendPropName: string): ((f?: Feature) => string) => {
  const propertyStyle = propertyStyles[layerName];
  if (!propertyStyle || !propertyStyle.legend) return () => 'blue';
  const items = propertyStyle.legend.items;
  return (f?: Feature) => {
    const value = f && f.properties ? f.properties[legendPropName] : undefined;
    if (typeof value === 'undefined') return items[0][2];
    let min = -Number.MAX_VALUE;
    for (let i = 0; i < items.length - 1; i++) {
      if (min < value && value <= items[i][1]) return items[i][2];
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
    if (typeof value === 'undefined') return items[0][0];
    let min = -Number.MAX_VALUE;
    for (let i = 0; i < items.length; i++) {
      if (min < value && value <= items[i][1]) return items[i][0];
      min = items[i][1];
    }
    return items[items.length - 1][0];
  };
};

export const propertyStyles = {
  _template: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "ID": {
        title: () => 'Identifier',
        value: (n: number) => `${n}`,
      },
    },
  },

  effluent: {
    properties: {
      FID_1: {
        title: () => 'ID',
        value: (s: string) => "     ",
      },
      ws: {
        title: () => 'Waterschap',
        value: (s: string) => capitalize(s),
      },
      LeidingTyp: {
        title: () => 'Leiding type',
        value: (s: string) => "",
      },
      Jaar: {
        title: () => 'jaar',
        value: (s: string) => "",
      },
      Diameter: {
        title: () => 'diameter',
        value: (s: string) => "",
      },
      Materiaal: {
        title: () => 'materiaal',
        value: (s: string) => "",
      },
      WP_GJ_z: {
        title: () => 'warmtepotentieel zomer (GJ)',
        value: (s: string) => "",
      },
      WP_GJ_w: {
        title: () => 'warmtepotentieel winter (GJ)',
        value: (s: string) => "",
      },
    },
  },

  ggz: {
    legend: rk_legend,
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => s,
      },
      "Organisatie": {
        title: () => 'Organisatie',
        value: (s: string) => s,
      },
      "Soort zorg": {
        title: () => 'Soort zorg',
        value: (s: string) => s,
      },
      "Straat": {
        title: () => 'Straat',
        value: (s: string) => s,
      },
      "Huisnummer": {
        title: () => 'Huisnummer',
        value: (s: string) => s,
      },
      "Postcode": {
        title: () => 'Postcode',
        value: (s: string) => s,
      },
      "Plaats": {
        title: () => 'Plaats',
        value: (s: string) => s,
      },
      "Routekaart": {
        title: () => 'Routekaart',
        value: (s: string) => s == undefined ? 'Niet ingeleverd' : s,
      },
    },
  },

  ghz: {
    legend: rk_legend,
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => s,
      },
      "Organisatie": {
        title: () => 'Organisatie',
        value: (s: string) => s,
      },
      "Soort zorg": {
        title: () => 'Soort zorg',
        value: (s: string) => s,
      },
      "Straat": {
        title: () => 'Straat',
        value: (s: string) => s,
      },
      "Huisnummer": {
        title: () => 'Huisnummer',
        value: (s: string) => s,
      },
      "Postcode": {
        title: () => 'Postcode',
        value: (s: string) => s,
      },
      "Plaats": {
        title: () => 'Plaats',
        value: (s: string) => s,
      },
      "Routekaart": {
        title: () => 'Routekaart',
        value: (s: string) => s == undefined ? 'Niet ingeleverd' : s,
      },
    },
  },

  gl_wk_bu: {
    legend: {
      items: [],
      title: 'wko value',
    },
    properties: {
      "WK_CODE": {
        title: () => 'Wijkcode',
        value: (s: string) => s,
      },
      "Wijk\/Buurtnaam -renamed": {
        title: () => 'Wijk/buurtnaam',
        value: (s: string) => s,
      },
      "GM_NAAM": {
        title: () => 'Gemeentenaam',
        value: (s: string) => s,
      },
      "Ronde subsidie": {
        title: () => 'Ronde subsidie',
        value: (s: string) => s,
      },
    },
  },

  rioolleidingen: {
    properties: {
      FID_1: {
        title: () => 'ID',
        value: (s: string) => "     ",
      },
      ws: {
        title: () => 'Waterschap',
        value: (s: string) => capitalize(s),
      },
      leidingtyp: {
        title: () => 'Leiding type',
        value: (s: string) => "",
      },
      jaar: {
        title: () => 'jaar',
        value: (s: string) => "",
      },
      diameter: {
        title: () => 'diameter',
        value: (s: string) => "",
      },
      materiaal: {
        title: () => 'materiaal',
        value: (s: string) => "",
      },
      wp_gj_z: {
        title: () => 'warmtepotentieel zomer (GJ)',
        value: (s: string) => "",
      },
      wp_gj_w: {
        title: () => 'warmtepotentieel winter (GJ)',
        value: (s: string) => "",
      },
    },
  },

  rwzis: {
    legend: {
      items: [],
      title: 'rwzi value',
    },
    properties: {
      Name: {
        title: () => 'Naam',
        value: (s: string) => capitalize(s),
      },
      ws: {
        title: () => 'Waterschap',
        value: (s: string) => capitalize(s),
      },
      gemeentena: {
        title: () => 'Gemeente',
        value: (s: string) => capitalize(s),
      },
      gj_exwko: {
        title: () => 'Technische potentie directe levering (GJ/jaar)',
        value: (s: string) => "",
      },
      gj_metwko: {
        title: () => 'Technische potentie met WKO (GJ/jaar)',
        value: (s: string) => "",
      },
      temp_z: {
        value: (s: string) => "",
        title: () => 'Temperatuur zomer (°C)',
      },
      temp_w: {
        title: () => 'Temperatuur winter (°C)',
        value: (s: string) => "",
      },
    },
  },

  vvt: {
    legend: rk_legend,
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => s,
      },
      "Organisatie": {
        title: () => 'Organisatie',
        value: (s: string) => s,
      },
      "Soort zorg": {
        title: () => 'Soort zorg',
        value: (s: string) => s,
      },
      "Straat": {
        title: () => 'Straat',
        value: (s: string) => s,
      },
      "Huisnummer": {
        title: () => 'Huisnummer',
        value: (s: string) => s,
      },
      "Postcode": {
        title: () => 'Postcode',
        value: (s: string) => s,
      },
      "Plaats": {
        title: () => 'Plaats',
        value: (s: string) => s,
      },
      "Routekaart": {
        title: () => 'Routekaart',
        value: (s: string) => s == undefined ? 'Niet ingeleverd' : s,
      },
    },
  },

  warmtenetten_nbr_infra: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "t": {
        title: () => 'Type',
        value: (s: string) => s,
      },
    },
  },

  warmtenetten_nbr_lokaal: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "naam_warmt": {
        title: () => 'Naam warmtenet',
        value: (s: string) => s,
      },
      "type_leidi": {
        title: () => 'Type leiding',
        value: (s: string) => capitalize(s),
      },
      "MEDIUM": {
        title: () => 'Medium',
        value: (s: string) => capitalize(s),
      },
      "STATUS": {
        title: () => 'Status',
        value: (s: string) => capitalize(s),
      },
      "SOORT": {
        title: () => 'Soort',
        value: (s: string) => capitalize(s),
      },
      "FUNCTION": {
        title: () => 'Functie',
        value: (s: string) => capitalize(s),
      },
    },
  },

  wateren_potentie_gt1ha: {
    legend: {
      items: [
        [true, 50000, '#ffc0c0', 'Tussen 0 en 50.000 GJ (0 - 1.250 hh)'],
        [true, 100000, '#ff9090', 'Tussen 50.000 en 100.000 GJ (1.250 - 2.500 hh)'],
        [true, 200000, '#ff4040', 'Tussen 100.000 en 200.000 GJ (2.500 - 5.000 hh)'],
        [true, Number.MAX_VALUE, '#ff0000', 'Boven 200.000 GJ (> 5.000 hh)'],
      ],
      title: 'Aquathermie potentieel (TEO)',
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
        value: (n: number) => `${Math.round(n / 1000) * 1000} GJ per jaar`,
      },
    },
  },

  wko_diepte: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "fid": {
        title: () => 'ID',
        value: (n: number) => `${n}`,
      },
      "Bronhouder": {
        title: () => 'Bronhouder',
        value: (s: string) => s,
      },
      "Max_Diepte": {
        title: () => 'Maximale diepte (m)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_natuur: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "id": {
        title: () => 'ID',
        value: (s: string) => s.split('.')[1],
      },
    },
  },

  wko_ordening: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "fid": {
        title: () => 'ID',
        value: (n: number) => `${n}`,
      },
      "Bronhouder": {
        title: () => 'Bronhouder',
        value: (s: string) => s,
      },
      "Max_Diepte": {
        title: () => 'Maximale diepte (m)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_specprovbeleid: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "fid": {
        title: () => 'ID',
        value: (n: number) => `${n}`,
      },
      "Bronhouder": {
        title: () => 'Bronhouder',
        value: (s: string) => s,
      },
      "Max_Diepte": {
        title: () => 'Maximale diepte (m)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_verbod: {
    legend: {
      items: [],
      title: 'value',
    },
    properties: {
      "fid": {
        title: () => 'ID',
        value: (n: number) => `${n}`,
      },
      "Bronhouder": {
        title: () => 'Bronhouder',
        value: (s: string) => s,
      },
    },
  },

  wko_gbes: {
    legend: {
      items: [],
      title: 'Bodemzijdig vermogen',
    },
    properties: {
      "Installatie ID": {
        title: () => 'Installatie ID',
        value: (n: number) => `${n}`,
      },
      "Bodemzijdig vermogen": {
        title: () => 'Bodemzijdig vermogen',
        value: (n: number) => `${n}`,
      },
      "Totale lengte": {
        title: () => 'Totale lengte',
        value: (n: number) => `${n}`,
      },
      warmtevraag: {
        title: () => 'warmtevraag',
        value: (n: number) => `${n}`,
      },
      koudevraag: {
        title: () => 'koudevraag',
        value: (n: number) => `${n}`,
      },
      energierendement: {
        title: () => 'energierendement',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_gwi: {
    legend: {
      items: [],
      title: 'wko value',
    },
    properties: {
      "Installatie ID": {
        title: () => 'Installatie ID',
        value: (n: number) => `${n}`,
      },
      "Status installatie": {
        title: () => 'Status installatie',
        value: (s: string) => s,
      },
      pompcapaciteit: {
        title: () => 'pompcapaciteit',
        value: (n: number) => `${n}`,
      },
      maxhoeveelheidm3onttrekking: {
        title: () => 'max hoeveelheid onttrekking (m3)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_gwio: {
    legend: {
      items: [],
      title: 'wko value',
    },
    properties: {
      "Installatie ID": {
        title: () => 'Installatie ID',
        value: (n: number) => `${n}`,
      },
      "Status installatie": {
        title: () => 'Status installatie',
        value: (s: string) => s,
      },
      pompcapaciteit: {
        title: () => 'pompcapaciteit',
        value: (n: number) => `${n}`,
      },
      maxhoeveelheidm3onttrekking: {
        title: () => 'max hoeveelheid onttrekking (m3)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_gwo: {
    legend: {
      items: [],
      title: 'wko value',
    },
    properties: {
      "Installatie ID": {
        title: () => 'Installatie ID',
        value: (n: number) => `${n}`,
      },
      "Status installatie": {
        title: () => 'Status installatie',
        value: (s: string) => s,
      },
      pompcapaciteit: {
        title: () => 'pompcapaciteit',
        value: (n: number) => `${n}`,
      },
      maxhoeveelheidm3onttrekking: {
        title: () => 'max hoeveelheid onttrekking (m3)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_installaties: {
    legend: {
      items: [],
      title: "WKO installatie",
    },
    properties: {
      "Installatie ID": {
        title: () => 'Installatie ID',
        value: (n: number) => `${n}`,
      },
      energierendement: {
         title: () => 'energierendement',
         value: (n: number) => `${n}`,
      },
      warmtevraag: {
        title: () => 'warmtevraag',
        value: (n: number) => `${n}`,
      },
      koudevraag: {
        title: () => 'koudevraag',
        value: (n: number) => `${n}`,
      },
      pompcapaciteit: {
        title: () => 'pompcapaciteit',
        value: (n: number) => `${n}`,
      },
      maxhoeveelheidm3onttrekking: {
        title: () => 'max hoeveelheid onttrekking (m3)',
        value: (n: number) => `${n}`,
      },
    },
  },

  wko_obes: {
    legend: {
      items: [],
      title: 'pompcapaciteit',
    },
    properties: {
      "Status put": {
        title: () => 'Status put',
        value: (s: string) => s,
      },
      pompcapaciteit: {
        title: () => 'pompcapaciteit',
        value: (n: number) => `${n}`,
      },
      maxhoeveelheidm3onttrekking: {
        title: () => 'max hoeveelheid onttrekking (m3)',
        value: (n: number) => `${n}`,
      },
    },
  },

  ziekenhuizen: {
    legend: rk_legend,
    properties: {
      "Locatienummer": {
        title: () => 'Locatienummer',
        value: (n: number) => `${n}`,
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
