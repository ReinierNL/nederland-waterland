import { Feature } from 'geojson';
import { capitalize } from '../utils';
import care_legend from '../assets/care_legend.json'
import legend_ci from '../assets/legend_ci.json'
import legend_pk from '../assets/legend_pk.json'
import legend_zh from '../assets/legend_zh.json'


const school_properties = {
  properties: {
    "Naam": {
      title: () => 'Naam',
      value: (s: string) => capitalize(s),
    },
    "Adres": {
      title: () => 'Adres',
      value: (s: string) => capitalize(s),
    },
    "PC": {
      title: () => 'Postcode',
      value: (s: string) => s.toUpperCase(),
    },
    "Plts": {
      title: () => 'Plaats',
      value: (s: string) => capitalize(s),
    },
    "Srt": {
      title: () => 'Soort onderwijs',
      value: (s: string) => s,
    },
  }
};

const wzv_legend_items = [ 
  'Thema niet genoemd in een gemeentelijke visie', 
  'Thema is alleen benoemd of er zijn procesdoelen of procesafspraken beschreven', 
  'Thema wordt onderzocht of zal onderzocht worden', 
  'Aan thema zijn één of meer van deze concrete doelen verbonden: aantal, locatie of jaar. Er wordt mogelijk ook gemonitord' 
];

export const toColorFactoryInterval = (layerName: string, legendPropName: string): ((f?: Feature) => string) => {
// returns a getColor function that maps a numeric value to a color (using propertyStyles[layerName])
  // console.log(`toColorFactoryInterval (layer=${layerName})`);
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


export const toColorFactoryDiscrete = (layerName: string, legendPropName: string): ((f?: Feature) => string) => {
  // returns a getColor function that maps a property value to a color (using propertyStyles[layerName])
  // console.log(`toColorFactoryDiscrete (layer=${layerName})`);
  const propertyStyle = propertyStyles[layerName];
  if (!propertyStyle || !propertyStyle.discretelegend) return () => 'blue';
  const items = propertyStyle.discretelegend.items;
  return (f?: Feature) => {
    const value = f && f.properties ? f.properties[legendPropName] : undefined;
    if (typeof value === 'undefined') return items[0][1];
    for (let i = 0; i < items.length - 1; i++) {
      if (value == items[i][0]) return items[i][1];
    }
    return items[items.length - 1][1];
  };
};


export const toFilterFactory = (layerName: string, legendPropName: string): ((f?: Feature) => boolean) => {
  // console.log(`toFilterFactory: ${layerName}`)
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


// export const showMain_BranchFilter = (showMain_BranchOnly: boolean): ((f?: Feature) => boolean) => {
//   return (f?: Feature) => {
//     if (!showMain_BranchOnly) return true;
//     const value = f && f.properties ? f.properties['IsMain_Branch'] : false;
//     return value
//   };
// };


export const showSelectedStatesFilter = (items: Array<[state1: boolean, state2: boolean, state3: boolean]>): ((f?: Feature) => boolean) => {
   return (f?: Feature) => {
    if (items.length === 0) { return true}  // this is the case when it is not a care layer
    const value = f && f.properties ? f.properties['Routekaart'] : false;
      if ((value === 'Actueel en vastgesteld') && items[0]) {
        return true
      }
      else if ((value === 'Wordt aan gewerkt') && items[1]) {
        return true
      }
      else if ((value === 'Niet ingeleverd') && items[2]) {
        return true
      }
      else {
        return false
      }
   };
};


// feature style for all Warmtenetten Vattenfall layers:

const wn_legend = {
  "items": [
    ["KOUDE PLAN", "#1fcc1f", "koude (gepland)"],
    ["KOUDE TRANSPORT", "#2723fa", "koude (transport)"],
    ["KOUDE WIJK", "#7f7cfa", "koude (wijk)"],
    ["WARMTE PLAN", "#ffa502", "warmte (gepland)"],
    ["WARMTE TRANSPORT", "#ff0000", "warmtenet (transport)"],
    ["WARMTE WIJK", "#ff7f7f", "warmtenet (wijk)"]
  ],
  "title": "type leiding"
} as { items: Array<[value: string, color: string, title: string]>; title: string } ;

const wn_properties = {
  "NETTYPE": {
    title: () => 'Type',
    value: (s: string) => s.toLowerCase(),
  }, 
  "STATUS": {
    title: () => 'Status',
    value: (s: string) => s.toLowerCase(),
  },
} as { [key: string]: { title: (s: string) => string; value: (s: any) => string | number } };

const wn_vf_featurestyle = {
  discretelegend: wn_legend,
  properties: wn_properties,
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

  categorale_instellingen: {
    legend: legend_ci,
    properties: {
      "Locatienummer": {
        title: () => 'Locatienummer',
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
    legend: care_legend,
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
        title: () => 'Status CO2-routekaart',
        value: (s: string) => s == undefined ? 'Niet ingeleverd' : s,
      },
      "Ambitie": {
        title: () => 'Ambitie',
        value: (s: string) => s.replace('+-', ''),
      },
    },
  },

  ghz: {
    legend: care_legend,
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
        title: () => 'Status CO2-routekaart',
        value: (s: string) => s == undefined ? 'Niet ingeleverd' : s,
      },
      "Ambitie": {
        title: () => 'Ambitie',
        value: (s: string) => s.replace('+-', ''),
      },
    },
  },

  gl_wk_bu: {
    properties: {
      "GM_NAAM": {
        title: () => 'Gemeente',
        value: (s: string) => s,
      },
      "WK_NAAM": {
        title: () => 'Wijk',
        value: (s: string) => s,
      },
      "BU_NAAM": {
        title: () => 'Buurt',
        value: (s: string) => s,
      },
    },
  },

  poliklinieken: {
    legend: legend_pk,
    properties: {
      "Locatienummer": {
        title: () => 'Locatienummer',
        value: (n: number) => `${n}`,
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

  schoolsNPO: {
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => capitalize(s),
      },
      "Adres": {
        title: () => 'Adres',
        value: (s: string) => capitalize(s),
      },
      "PC": {
        title: () => 'Postcode',
        value: (s: string) => s.toUpperCase(),
      },
      "Plts": {
        title: () => 'Plaats',
        value: (s: string) => capitalize(s),
      },
      "Srt": {
        title: () => 'Soort onderwijs',
        value: (s: string) => s,
      },
    }
  },

  schoolsPO: {
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => capitalize(s),
      },
      "Adres": {
        title: () => 'Adres',
        value: (s: string) => capitalize(s),
      },
      "PC": {
        title: () => 'Postcode',
        value: (s: string) => s.toUpperCase(),
      },
      "Plts": {
        title: () => 'Plaats',
        value: (s: string) => capitalize(s),
      },
      "Srt": {
        title: () => 'Soort onderwijs',
        value: (s: string) => s,
      },
    }
  },
  
  sports: {
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => capitalize(s),
      },
      "Adres": {
        title: () => 'Adres',
        value: (s: string) => capitalize(s),
      },
      "PC": {
        title: () => 'Postcode',
        value: (s: string) => s.toUpperCase(),
      },
      "Plts": {
        title: () => 'Plaats',
        value: (s: string) => capitalize(s),
      },
      "sport": {
        title: () => 'Sport',
        value: (s: string) => capitalize(s),
      },
    }
  },


  skating: {
    properties: {
      "Naam": {
        title: () => 'Naam',
        value: (s: string) => capitalize(s),
      },
      "Adres": {
        title: () => 'Adres',
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
    },
  },

  swimming: {
    properties: {
      "naam": {
        title: () => 'Naam',
        value: (s: string) => capitalize(s),
      },
      "adres": {
        title: () => 'Adres',
        value: (s: string) => s,
      },
      "postcode": {
        title: () => 'Postcode',
        value: (s: string) => s,
      },
      "plaats": {
        title: () => 'Plaats',
        value: (s: string) => s,
      },
    },
  },

  tvw: {
    discretelegend: {
      items: [
        [1, '#233d5a', 'Vastgesteld; beschikbaar'],
        [2, '#576b81', 'Vastgesteld; niet beschikbaar'],
        [3, '#8c9aa9', 'In concept; beschikbaar'],
        [4, '#c5ccd4', 'In concept; niet beschikbaar'],
      ],
      title: 'Status',
    },
    properties: {
      "Gemeentenaam": {
        title: () => 'Gemeente',
        value: (s: string) => s,
      },
      "TVW_status": {
        title: () => 'Status',
        value: (v: number) => v <= 2 ? 'Definitief vastgesteld door het gemeentebestuur' : 'In concept vastgesteld door het gemeentebestuur',
      },
      "pdf": {
        title: () => 'Document',
        value: (s: string) => s == undefined ? 'Niet beschikbaar' : 'PDF beschikbaar',
      },
    }
  },

  vvt: {
    legend: care_legend,
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
        title: () => 'Status CO2-routekaart',
        value: (s: string) => s,
      },
      "Ambitie": {
        title: () => 'Ambitie',
        value: (s: string) => s.replace('+-', ''),
      },
    },
  },

  warmtenetten_nbr_infra: {
    properties: {
      "t": {
        title: () => 'Type',
        value: (s: string) => s,
      },
    },
  },

  warmtenetten_nbr_lokaal: {
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
    properties: {
      "id": {
        title: () => 'ID',
        value: (s: string) => s.split('.')[1],
      },
    },
  },

  wko_ordening: {
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

  wn_vf_almere: wn_vf_featurestyle,
  wn_vf_amsterdam: wn_vf_featurestyle,
  wn_vf_arnhem: wn_vf_featurestyle,
  wn_vf_ede: wn_vf_featurestyle,
  wn_vf_leiden: wn_vf_featurestyle,
  wn_vf_lelystad: wn_vf_featurestyle,
  wn_vf_nijmegen: wn_vf_featurestyle,
  wn_vf_rotterdam: wn_vf_featurestyle,
  wn_vf_vlieland: wn_vf_featurestyle,
  
  wzv: {
    discretelegend: {
      "items": [
          [1, "#A5285D", wzv_legend_items[0]],
          [2, "#EB5C92", wzv_legend_items[1]],
          [3, "#77C5B9", wzv_legend_items[2]],
          [4, "#396F5D", wzv_legend_items[3]]
          ],
      "title": "Woonzorgvisie status"
    },
    properties: {
      "status": {
        title: () => 'Status',
        value: (n: number) => wzv_legend_items[n-1],
      },
      "naam": {
        title: () => 'Gemeente',
        value: (s: string) => s,
      },
    },
  },

  ziekenhuizen: {
    legend: legend_zh,
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
    discretelegend?: { items: Array<[value: number|string, color: string, title: string]>; title: string };
    legend?: { items: Array<[active: boolean, max: number, color: string, title: string]>; title: string };
    // stringlegend?: { items: Array<[value: string, color: string, title: string]>; title: string };
    properties: { [key: string]: { title: (s: string) => string; value: (s: any) => string | number } };
  }
>;
