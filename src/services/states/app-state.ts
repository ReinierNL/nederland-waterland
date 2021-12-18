import m from 'mithril';
import Stream from 'mithril/stream';
import { IAppModel, UpdateStream } from '../meiosis';
import { FeatureCollection, Feature, GeoJsonObject, Point, LineString, Polygon } from 'geojson';
import { actions } from '..';
import L, { LeafletEvent } from 'leaflet';
import { NamedGeoJSONOptions } from '../../components';
import { toColorFactoryDiscrete, toColorFactoryInterval, toFilterFactory } from '../../models';
import { isCareLayer, isCareOrCureLayer, isCureLayer, isSportLayer, isVattenfallLayer } from '../../components/utils_rs';
import { pointToLayerCare, pointToTitledLayer } from '../../components/markers'

// layer data:
import categorale_instellingen from '../../data/categorale instellingen.json';
import effluent from '../../data/Syntraal_effluent.json';
import ggz from '../../data/ggz.json';
import ghz from '../../data/ghz.json';
// import rioolleidingen:  loaded dynamically. see rioolleidingenLayer
import gl_wk_bu from '../../data/gasloze wijken en buurten.json';
import poliklinieken from '../../data/poliklinieken.json';
import skatings from '../../data/ijsbanen.json';
import rwzis from '../../data/Syntraal_rwzis.json';
import swimmings from '../../data/zwembaden.json';
import tvw from '../../data/tvw_shapes.json';
import vvt from '../../data/vvt.json';
import warmtenetten_nbr_lokaal from '../../data/lokale_warmtenetten_20200519.json';
import warmtenetten_nbr_infra from '../../data/infrastructuur_warmte.json';
// // wko point layers
import wko_gwi from '../../data/WKO_GWI.json';
import wko_gwio from '../../data/WKO_GWIO.json';
// import wko_gwo:  loaded dynamically. see wko_gwoLayer
// import wko_gbes:  loaded dynamically. see wko_gbesLayer
import wko_obes from '../../data/WKO_OBES.json';
// import wko_installaties:  loaded dynamically. see wko_installatiesLayer
// // wko restriction layers
import wko_diepte from '../../data/WKO Restrictie Diepte.json';
// import wko_natuur: loaded dynamically. see wko_natuurLayer
import wko_ordening from '../../data/WKO Restrictie Ordening.json';
// import wko_specprovbeleid: loaded dynamically. see wko_spec_prov_beleidLayer
import wko_verbod from '../../data/WKO Verbodsgebieden.json';
// import wn_vf_xxx: loaded dynamically  (9 layers)
import ziekenhuizen from '../../data/ziekenhuizen.json';

// Add curline        // (RS): What is curline??
// is this to add a property 'active' so we can use it elsewhere?
ziekenhuizen.features = ziekenhuizen.features.map((z: any) => ({
  ...z,
  properties: {
    ...z.properties,
    active: true,
  },
}));

/** Application state */
export interface IAppStateModel {
  app: Partial<{
    zoom: -1;
    // water?: FeatureCollection;
    /** Layer with selected markers */
    selectedMarkersLayer: L.GeoJSON;
    effluent: FeatureCollection;
    ggz: FeatureCollection<Point>;
    ghz: FeatureCollection<Point>;
    gl_wk_bu: FeatureCollection;
    categorale_instellingen: FeatureCollection<Point>;
    poliklinieken: FeatureCollection<Point>;
    rioolleidingenLayer: L.GeoJSON;
    rwzis: FeatureCollection<Point>;
    skatings: FeatureCollection;
    swimmings: FeatureCollection;
    tvw: L.GeoJSON;
    vvt: FeatureCollection<Point>;
    warmtenetten_nbr_infra: FeatureCollection;
    warmtenetten_nbr_lokaal: FeatureCollection;
    wateren_potentie_gt1haLayer: L.GeoJSON;
    wko_gwi: FeatureCollection;
    wko_gwio: FeatureCollection;
    wko_gwoLayer: L.GeoJSON;
    wko_gbesLayer: L.GeoJSON;
    wko_obes: FeatureCollection;
    wko_installatiesLayer: L.GeoJSON;
    wko_diepte: FeatureCollection;
    wko_natuurLayer: L.GeoJSON;
    wko_ordening: FeatureCollection;
    wko_specprovbeleidLayer: L.GeoJSON;
    wko_verbod: FeatureCollection;
    wn_vf_almereLayer: L.GeoJSON;
    wn_vf_amsterdamLayer: L.GeoJSON;
    wn_vf_arnhemLayer: L.GeoJSON;
    wn_vf_edeLayer: L.GeoJSON;
    wn_vf_leidenLayer: L.GeoJSON;
    wn_vf_lelystadLayer: L.GeoJSON;
    wn_vf_nijmegenLayer: L.GeoJSON;
    wn_vf_rotterdamLayer: L.GeoJSON;
    wn_vf_vlielandLayer: L.GeoJSON;
    ziekenhuizen: FeatureCollection<Point>;
    /** Bounding box size */
    size: number;
    /** Last item that was clicked */
    selectedItem: Feature<Point>;
    /** Last item's layer name */
    selectedLayer: string;
    selectedHospital: Feature<Point>;
    /** Layers that are loaded */
    activeLayers: Set<string>;
    /** is the routekaarten info active */
    rk_active: boolean;
    [key: string]: L.GeoJSON | any;
  }>;
}

export interface IAppStateActions {
  mapClick: () => void;
  refreshLayer: (layer?: string) => Promise<void>;
  selectFeature: (f: Feature<Point | LineString | Polygon>, layerName?: string, layer?: L.Layer) => void;
  selectHospital: (f: Feature<Point>, layerName?: string) => Promise<void>;
  setZoomLevel: (zoom: number) => void;
  toggleRoutekaartActivity: () => Promise<void>; 
  updateActiveLayers: (layer: string, add: boolean) => Promise<void>;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}

const highlightMarker = (selectedMarkersLayer: L.GeoJSON, f: Feature, layerName: string = '', primarySelection = true) => {
  if (f.geometry.type !== 'Point') return;
  const lng = f.geometry.coordinates[0];
  const lat = f.geometry.coordinates[1];
  const color = primarySelection ? 'blue' : undefined;
  selectedMarkersLayer.addLayer(
    L.circleMarker([lat, lng], {
      radius: 20,
      color,
      fillColor: 'blue',
      fillOpacity: 0.3,
      opacity: 1,
    })
  );
  if (isCareLayer(layerName)) {
    selectedMarkersLayer.addLayer(
      pointToLayerCare(f as any, new L.LatLng(lat, lng))
        .on('click', () => {
          actions.selectFeature(f as Feature<Point>, layerName);
        })
    );
  };
};

const createLayerTVW = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  return L.geoJSON(initialData, {
    onEachFeature: (feature: Feature<LineString, any>, layer: L.Layer) => {
      layer.on('click', (e: LeafletEvent) => {
        // actions.selectFeature(feature as Feature<LineString>, e.target?.options?.name, layer);
        actions.selectFeature(feature as Feature<LineString>, name, layer);
      });
    },
    style: (f) => {
      const color = '#233d5a';
      const opacity = 1 - (f?.properties[legendPropName]-1)/4
      return {
        color: 'White',
        weight: 1,
        fillColor: color,
        fillOpacity: opacity,
      };
    },
    name,
  } as NamedGeoJSONOptions);
};

const createLayerVF = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  console.log(`createLayerVF: name=${name}; legendProp=${legendPropName}`)
  const getColor = toColorFactoryDiscrete(name, legendPropName);
  return L.geoJSON(initialData, {
    onEachFeature: (feature: Feature<LineString, any>, layer: L.Layer) => {
      layer.on('click', (e: LeafletEvent) => {
        // actions.selectFeature(feature as Feature<LineString>, e.target?.options?.name, layer);
        actions.selectFeature(feature as Feature<LineString>, name, layer);
      });
    },
    style: (f) => {
      const color = getColor(f);
      return {
        color,
        fillColor: color,
        fillOpacity: 0.8,
      };
    },
    name,
  } as NamedGeoJSONOptions);
};

const createLeafletLayer = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  const getColor = toColorFactoryInterval(name, legendPropName);
  const filter = toFilterFactory(name, legendPropName);
  return L.geoJSON(initialData, {
    pointToLayer: pointToTitledLayer,
    onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
      layer.on('click', (e: LeafletEvent) => {
        actions.selectFeature(feature as Feature<Point>, e.target?.options?.name, layer);
      });
    },
    filter,
    style: (f) => {
      const color = getColor(f);
      return {
        color,
        fillColor: color,
        fillOpacity: 0.8,
      };
    },
    name,
  } as NamedGeoJSONOptions);
};

const pointToGrayCircleMarkerLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  const marker = new L.CircleMarker(latlng, {
    radius: 10,
    stroke: false,
    fillColor: 'gray',
    fillOpacity: 0.6,
  });
  feature.properties && feature.properties.PC6 && marker.bindTooltip(feature.properties.PC6);
  return marker;
};

const pointToGreenCircleMarkerLayer = (_feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    stroke: false,
    fillColor: 'green',
    fillOpacity: 0.8,
  });
};

const pointToYellowCircleMarkerLayer = (_feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    weight: 1,
    color: 'orange',
    fillColor: 'yellow',
    fillOpacity: 0.8,
  });
};

let highlightedLayer: L.Path;
let highlightedColor = '';

interface IPathOptions extends L.PathOptions {
  style?: () => {
    color?: string;
    fillColor?: string;
    opacity?: number;
  };
}

export const appStateMgmt = {
  initial: {
    app: {
      vvt,
      ggz,
      ghz,
      rwzis,
      effluent,
      rioolleidingenLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
          layer.on('click', (e) => {
            actions.selectFeature(feature as Feature<Point>, e.target?.options?.name, layer);
          });
        },
        name: 'rioolleidingen',
      } as NamedGeoJSONOptions),
      gl_wk_bu,
      skatings,
      swimmings,
      tvwLayer: createLayerTVW('tvw', 'TVW_status', tvw),
      warmtenetten_nbr_lokaal,
      warmtenetten_nbr_infra,
      wko_gwi,
      wko_gwio,
      wko_gwoLayer: L.geoJSON(undefined, {
        pointToLayer: pointToGreenCircleMarkerLayer,
        onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Point>, 'wko_gwo', layer);
          });
        },
        name: 'wko_gwo',
      } as NamedGeoJSONOptions),
      wko_gbesLayer: L.geoJSON(undefined, {
        pointToLayer: pointToYellowCircleMarkerLayer,
        onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Point>, 'wko_gbes', layer);
          });
        },
        name: 'wko_gbes',
      } as NamedGeoJSONOptions),
      wko_obes,
      wko_installatiesLayer: L.geoJSON(undefined, {
        pointToLayer: pointToGrayCircleMarkerLayer,
        onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Point>, 'wko_installaties', layer);
          });
        },
        name: 'wko_installaties',
      } as NamedGeoJSONOptions),
      wko_diepte, //  this layer has a style assignment in home-page.ts
      wko_natuurLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Polygon>, layer: L.Layer) => {
          layer.on('click', (e) => {
            actions.selectFeature(feature as Feature<Polygon>, e.target?.options?.name, layer);
          });
        },
        style: () => {
          return {
            color: 'green',
            fillColor: 'green',
          };
        },
        name: 'wko_natuur',
      } as NamedGeoJSONOptions),
      wko_ordening, //  this layer has a style assignment in home-page.ts
      wko_specprovbeleidLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Polygon>, layer: L.Layer) => {
          layer.on('click', (e) => {
            actions.selectFeature(feature as Feature<Polygon>, e.target?.options?.name, layer);
          });
        },
        style: () => {
          return {
            color: 'orange',
            fillColor: 'orange',
          };
        },
        name: 'wko_specprovbeleid',
      } as NamedGeoJSONOptions),

      wko_verbod,
      wateren_potentie_gt1haLayer: createLeafletLayer('wateren_potentie_gt1ha', 'AVGwocGJ_1'),

      wn_vf_almereLayer: createLayerVF('wn_vf_almere', 'NETTYPE', undefined),
      wn_vf_amsterdamLayer: createLayerVF('wn_vf_amsterdam', 'NETTYPE', undefined),
      wn_vf_arnhemLayer: createLayerVF('wn_vf_arnhem', 'NETTYPE', undefined),
      wn_vf_edeLayer: createLayerVF('wn_vf_ede', 'NETTYPE', undefined),
      wn_vf_leidenLayer: createLayerVF('wn_vf_leiden', 'NETTYPE', undefined),
      wn_vf_lelystadLayer: createLayerVF('wn_vf_lelystad', 'NETTYPE', undefined),
      wn_vf_nijmegenLayer: createLayerVF('wn_vf_nijmegen', 'NETTYPE', undefined),
      wn_vf_rotterdamLayer: createLayerVF('wn_vf_rotterdam', 'NETTYPE', undefined),
      wn_vf_vlielandLayer: createLayerVF('wn_vf_vlieland', 'NETTYPE', undefined),

      categorale_instellingen,
      poliklinieken,
      ziekenhuizen,
      activeLayers: new Set(),
      selectedMarkersLayer: L.geoJSON(undefined),
    },
  } as IAppStateModel,

  actions: (update, states): IAppStateActions => {
    return {
      mapClick: () => {
        console.log('mapclick action');
        const {
          app: { selectedMarkersLayer, selectedLayer },
        } = states();
        selectedMarkersLayer!.clearLayers();
        var new_sl = selectedLayer;
        if (isCareOrCureLayer(new_sl!) || isSportLayer(new_sl!)) {
          // new_sl = undefined    // if setting it to undefined, the legend disappears
          console.log('mapclick calling update()');
          update({ app: { selectedItem: undefined, selectedLayer: new_sl, selectedHospital: undefined } });
        };
        console.log('mapclick action finished');
      },
      selectFeature: async (f, selectedLayer?: string, layer?: L.Layer) => {
        console.log('Select feature');
        console.log('Selected layer: ' + selectedLayer);
        const {
          app: { selectedMarkersLayer, ggz, ghz, vvt, selectedHospital: old_sh },
        } = states();
        var new_sh = old_sh;
        if (selectedLayer != 'ziekenhuizen') new_sh = undefined;
      // console.log('Highlighted layer: ' + highlightedLayer.name);
        if (highlightedLayer && highlightedLayer.setStyle) {
          highlightedLayer.setStyle({ color: highlightedColor });
          if (layer && (layer as L.Path).options) {
            const path = layer as L.Path;
            highlightedLayer = path;
            const options = path.options as IPathOptions;
            const style = options && options.style && options.style();
            if (style && style.color) highlightedColor = style.color;
            path.setStyle({
              color: 'blue',
            });
          }
        } else {
          if (!selectedMarkersLayer) return;
          selectedMarkersLayer.clearLayers();
          selectedMarkersLayer.bringToBack();
          const organisatie = f.properties?.Organisatie;
          if (organisatie && !/onbekend/i.test(organisatie)) {
            const overlay =
              selectedLayer === 'ggz' ? ggz : selectedLayer === 'ghz' ? ghz : selectedLayer === 'vvt' ? vvt : undefined;
            const id = f.properties?.Id;
            overlay &&
              overlay.features
                .filter((z) => z.properties?.Organisatie === organisatie)
                .forEach((z) => highlightMarker(selectedMarkersLayer, z, selectedLayer, z.properties?.Id === id));
          } else {
            highlightMarker(selectedMarkersLayer, f, selectedLayer!);
          }
        }
        update({ app: { selectedItem: () => f, selectedLayer, selectedHospital: new_sh } });
      },
      selectHospital: async (f, layerName: string) => {
        console.log('Select hospital (cure location); layerName = ' + layerName);
        const { app } = states();
        const { activeLayers, selectedHospital, selectedMarkersLayer, categorale_instellingen, poliklinieken, ziekenhuizen } = app;
        var sActiveLayers = ''
        activeLayers?.forEach((layer) => {
          sActiveLayers = sActiveLayers + `${layer}`  + ', '
        });  // trailing comma and space are not removed (not necessary)
        if (selectedHospital && selectedHospital.properties?.Locatienummer === f.properties?.Locatienummer) return;
        const updating = [] as Array<Promise<{ [key: string]: L.GeoJSON }>>;
        activeLayers?.forEach((layer) => {
          updating.push(loadGeoJSON(layer, f, app));
        });
        const result = (await Promise.all(updating)).reduce((acc, cur) => {
          Object.keys(cur)
            .filter(Boolean)
            .forEach((key) => (acc[key] = cur[key]));
          return acc;
        }, {} as { [key: string]: L.GeoJSON });
        if (selectedMarkersLayer) {
          selectedMarkersLayer.clearLayers();
          selectedMarkersLayer.bringToBack();
          const id = f.properties?.Locatienummer;
          const organisatie = f.properties?.Organisatie;
          if (ziekenhuizen && sActiveLayers.includes('ziekenhuizen')) {
            organisatie &&
            ziekenhuizen.features
                .filter((z) => z.properties && z.properties.Organisatie === organisatie)
                .forEach((z) => highlightMarker(selectedMarkersLayer, z, 'ziekenhuizen', z.properties?.Locatienummer === id));
          }
          if (poliklinieken && sActiveLayers.includes('poliklinieken')) {
            organisatie &&
            poliklinieken.features
                .filter((z) => z.properties && z.properties.Organisatie === organisatie)
                .forEach((z) => highlightMarker(selectedMarkersLayer, z, 'poliklinieken', z.properties?.Locatienummer === id));
          }
          if (categorale_instellingen && sActiveLayers.includes('categorale_instellingen')) {
            organisatie &&
            categorale_instellingen.features
                .filter((z) => z.properties && z.properties.Organisatie === organisatie)
                .forEach((z) => highlightMarker(selectedMarkersLayer, z, 'categorale_instellingen', z.properties?.Locatienummer === id));
          }
        }
        update({
          app: { selectedHospital: () => f, selectedLayer: layerName, selectedItem: undefined, ...result },
        });
      },
      refreshLayer: async (layer?: string) => {
        console.log('refreshLayer. layer: ' + layer)
        const { app } = states();
        const { selectedHospital } = app;
        if (!selectedHospital || !layer) return;
        const result = await loadGeoJSON(layer, selectedHospital, app);
        update({ app: { ...result } });
      },
      setZoomLevel: (zoom: number) => update({ app: { zoom } }),
      toggleRoutekaartActivity: async () => {
        console.log('toggleRoutekaartActivity')
        const { app } = states();
        var { rk_active } = app;
        rk_active = !rk_active;
        update({ app: { rk_active } });
      },
      updateActiveLayers: async (selectedLayer: string, add: boolean) => {
        console.log(`updateActiveLayers; selectedLayer=${selectedLayer}`)
        const { app } = states();
        const { activeLayers, 
                selectedHospital: old_sh,
                selectedLayer: old_sl, 
                selectedMarkersLayer } = app;
        // console.log(`selectedLayer=${selectedLayer}; old_sl=${old_sl}`)
        if ( isVattenfallLayer(selectedLayer) && add ) {
          const result = await loadGeoJSON_VF(selectedLayer, app);
          return result
        } else {
          // console.log('NOT calling loadGeoJSON_VF');
        };
        var new_sh = old_sh;
        if (add) {
          activeLayers!.add(selectedLayer);
        } else {
          activeLayers!.delete(selectedLayer);
          if (old_sl === selectedLayer) selectedMarkersLayer?.clearLayers();
          selectedLayer = ''
        }
        if (!isCureLayer(selectedLayer)) new_sh = undefined;
        // console.log(activeLayers);
        if (add && new_sh && new_sh.properties && new_sh.properties.Locatienummer) {
          const result = await loadGeoJSON(selectedLayer, new_sh, app);
          update({ app: { activeLayers, selectedLayer, selectedHospital: new_sh, ...result } });
        } else {
          update({ app: { activeLayers, selectedLayer, selectedHospital: new_sh } });
        };
      },
    } as IAppStateActions;
  },
} as IAppState;

const loadGeoJSON_VF = async (layer: string, app: { [key: string]: L.GeoJSON }) => {
// loads GeoJSOn data for a Vattenfall warmtenetten layer, if not already loaded
  // console.log(`LoadGeoJSON2`);
  const layerName = layer + 'Layer';
  // console.log(`layerName: ${layerName}`);
  var city = layerName.substring(6, layerName.length - 5);
  city = city.charAt(0).toUpperCase() + city.slice(1)
  // console.log(`stad: ${city}`);

  const filename = `Warmtenetten Vattenfall.${city}.geojson`
  // const host = `http://localhost:3366`;
  const host = `https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl`;
  console.log(`preparing to request: ${layerName}`);
  const geojson = app[layerName] ? (app[layerName] as L.GeoJSON) : undefined;

  if (geojson) {
    // console.log(`requesting`);
    // console.log(`geojson._layers.length = ${Object.keys(geojson._layers).length}`);
    if (Object.keys(geojson._layers).length > 0) { 
      // if it already contains data there's no need to load it again
      return {} 
    }
    const record = await m.request<{ id: number; features: FeatureCollection }>({
      method: 'GET',
      url: `${host}/${filename}`,
    });
    if (record && record.features) {
      // console.log(`Request returned data (features)`);
      geojson.clearLayers();
      geojson.addData(record.features);
      return { [layerName]: geojson };
    } else {
      console.log(`NO data (or no features) was received; url=${host}/${filename}`);
      return {};
    }
  } else {
    console.log(`sent no request (no geojson)`);
  }
  return {};
};

const loadGeoJSON = async (layer: string, selectedHospital: Feature, app: { [key: string]: L.GeoJSON }) => {
  const layerName = layer + 'Layer';
  const id = (selectedHospital.properties as any).Locatienummer;
  const geojson = app[layerName] ? (app[layerName] as L.GeoJSON) : undefined;
  if (geojson) {
    console.log(`process.env.GIS_SERVER: ${process.env.GIS_SERVER}`);
    const the_url = `${process.env.GIS_SERVER || 'https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/geojson-server/api/'}${layer}/id/${id}`;
    console.log(`URL: ${the_url}`);
    const record = await m.request<{ id: number; data: FeatureCollection }>({
      method: 'GET',
      // url: `${process.env.GIS_SERVER || 'http://localhost:3366/api/'}${layer}/id/${id}`,
      // url: `${process.env.GIS_SERVER || 'http://163.158.64.118:3366/api/'}${layer}/id/${id}`,
      // url: `${process.env.GIS_SERVER || 'https://assistance.hex.tno.nl/geojson-server/api/'}${layer}/id/${id}`,
      url: `${process.env.GIS_SERVER || 'https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/geojson-server/api/'}${layer}/id/${id}`,
    });
    if (record && record.data) {
      geojson.clearLayers();
      geojson.addData(record.data);
      return { [layerName]: geojson };
      // update({ app: { activeLayers, [layerName]: geojson } });
    } else {
      return {};
      // update({ app: { activeLayers } });
    }
  }
  return {};
};
