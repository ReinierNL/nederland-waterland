import m from 'mithril';
import Stream from 'mithril/stream';
import { IAppModel, UpdateStream } from '../meiosis';
import verzorgingshuizen from '../../data/verzorgingshuizen.json';
import ziekenhuizen_rk from '../../data/ziekenhuizen_routekaarten.json';
import ziekenhuizen_v3 from '../../data/ziekenhuizen.v3.json';
import ggz from '../../data/ggz.json';
import ghz from '../../data/ghz.json';
import vvt from '../../data/vvt.json';
import rwzis from '../../data/Syntraal_rwzis.json';
import effluent from '../../data/Syntraal_effluent.json';
// import rioolleidingen:  loaded dynamically. see rioolleidingenLayer
// import gl_wk_bu from '../../data/gasloze wijken en buurten.json';
// // wko point layers
import wko_gwi from '../../data/WKO_GWI.json';
import wko_gwio from '../../data/WKO_GWIO.json';
import wko_gwo from '../../data/WKO_GWO.json';
import wko_gbes from '../../data/WKO_GBES.json'; 
import wko_obes from '../../data/WKO_OBES.json';
// import wko_installaties:  loaded dynamically. see wko_installatiesLayer
// // wko restriction layers
import wko_diepte from '../../data/WKO Restrictie Diepte.json';
// import wko_natuur: loaded dynamcally. see wko_natuurLayer
import wko_ordening from '../../data/WKO Restrictie Ordening.json';
// import wko_specprovbeleid: loaded dynamcally. see wko_spec_prov_beleidLayer
import wko_verbod from '../../data/WKO Verbodsgebieden.json';
import { createIcon, ziekenhuisIcon } from '../../utils';
import { FeatureCollection, Feature, Point, GeoJsonObject } from 'geojson';
import { actions } from '..';
import L, { LeafletEvent } from 'leaflet';
import { NamedGeoJSONOptions } from '../../components';
import { toColorFactory, toFilterFactory } from '../../models';

// Add curline        // (RS): What is curline??
// is this to add a property 'active' so we can use it elsewhere?
ziekenhuizen_v3.features = ziekenhuizen_v3.features.map((z: any) => ({
  ...z,
  properties: {
    ...z.properties,
    active: true,
  },
}));


/** Application state */

export interface IAppStateModel {
  app: Partial<{
    // water?: FeatureCollection;
    vvt: FeatureCollection<Point>;
    ggz: FeatureCollection<Point>;
    ghz: FeatureCollection<Point>;
    wateren_potentie_gt1haLayer: L.GeoJSON;
    rwzis: FeatureCollection<Point>;
    effluent: FeatureCollection;
    rioolleidingenLayer: L.GeoJSON;
    gl_wk_bu: FeatureCollection;
    wko_gwi: FeatureCollection;
    wko_gwio: FeatureCollection;
    wko_gwo: FeatureCollection;
    wko_gbes: FeatureCollection;
    wko_obes: FeatureCollection;
    wko_installatiesLayer: L.GeoJSON;
    wko_diepte: FeatureCollection;
    wko_natuurLayer: L.GeoJSON;
    wko_ordening: FeatureCollection;
    wko_specprovbeleidLayer: L.GeoJSON;
    wko_verbod: FeatureCollection;
    /** Bounding box size */
    size: number;
    /** Last item that was clicked */
    selectedItem: Feature<Point>;
    /** Last item's layer name */
    selectedLayer: string;
    selectedHospital: Feature<Point>;
    selectedWaterItem: Feature;
    verzorgingshuizen: FeatureCollection<Point>;
    ziekenhuizen_rk: FeatureCollection<Point>;
    ziekenhuizen_v3: FeatureCollection<Point>;
    /** Layers that are loaded */
    activeLayers: Set<string>;
    [key: string]: L.GeoJSON | any;
  }>;
}

export interface IAppStateActions {
  selectFeature: (f: Feature<Point>, layerName?: string) => void;
  selectHospital: (f: Feature<Point>) => Promise<void>;
  selectWaterFeature: (f: Feature) => void;
  toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => void;
  setBoundingBoxSizeInMeter: (size: number) => void;
  updateActiveLayers: (layer: string, add: boolean) => Promise<void>;
  refreshLayer: (layer?: string) => Promise<void>;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}
const size = 5000;

const createLeafletLayer = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  const getColor = toColorFactory(name, legendPropName);
  const filter = toFilterFactory(name, legendPropName);
  return L.geoJSON(initialData, {
    onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
      layer.on('click', (e: LeafletEvent) => {
        actions.selectFeature(feature as Feature<Point>, e.target?.options?.name);
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
  return new L.CircleMarker(latlng, {
    radius: 10,
    stroke: false,
    fillColor: 'gray',
    fillOpacity: 0.6,
  });
};

export const appStateMgmt = {
  initial: {
    app: {
      size,
      vvt,
      ggz,
      ghz,
      // wateren,
      rwzis,
      effluent,
      rioolleidingenLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Point>);
          });
        },
        name: 'rioolleidingen',
      } as NamedGeoJSONOptions),
      // gl_wk_bu,
      wko_gwi,
      wko_gwio,
      wko_gwo,
      wko_gbes,
      wko_obes,
      wko_installatiesLayer: L.geoJSON(undefined, {
        pointToLayer: pointToGrayCircleMarkerLayer,
        onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Point>);
          });
        },
        name: 'wko_installaties',
      } as NamedGeoJSONOptions),
      wko_diepte,   //  this layer has a style assignment in home-page.ts
      wko_natuurLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Polygon>);
          });
        },
        style: (f) => {
          return {
            color: 'green',
            fillColor: 'green',
          };
        },
        name: 'wko_natuur',
      } as NamedGeoJSONOptions),
      wko_ordening, //  this layer has a style assignment in home-page.ts
      wko_specprovbeleidLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Polygon>);
          });
        },
        style: (f) => {
          return {
            color: 'orange',
            fillColor: 'orange',
          };
        },
        name: 'wko_specprovbeleid',
      } as NamedGeoJSONOptions),

      wko_verbod,
      wateren_potentie_gt1haLayer: createLeafletLayer('wateren_potentie_gt1ha', 'AVGwocGJ_1'),
      verzorgingshuizen,
      ziekenhuizen_rk,
      ziekenhuizen_v3,
      isSearching: false,
      searchQuery: '',
      activeLayers: new Set(),
    },
  } as IAppStateModel,
  actions: (update, states): IAppStateActions => {
    return {
      setBoundingBoxSizeInMeter: (size) => update({ app: { size } }),
      selectWaterFeature: (f) => {
        update({ app: { selectedWaterItem: f } });
        m.redraw();
      },
      selectFeature: async (f, selectedLayer?: string) => {
        update({ app: { selectedItem: () => f, selectedLayer } });
      },
      selectHospital: async (f) => {
        const { app } = states();
        const { activeLayers, selectedHospital } = app;
        if (selectedHospital && selectedHospital.properties?.Locnr === f.properties?.Locnr) return;
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
        update({ app: { selectedHospital: () => f, selectedItem: undefined, selectedLayer: undefined, ...result } });
      },
      toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => {
        const {
          app: { hospitals },
        } = states();
        if (!hospitals) return;
        hospitals.features.some((h) => {
          if (h.properties.id === id) {
            h.properties.active = !h.properties.active;
            return true;
          }
          return false;
        });
        if (layer) {
          let i = 0;
          layer.eachLayer((l) => {
            const curHospital = hospitals.features[i].properties;
            if (curHospital.active) {
              (l as L.Marker).setIcon(createIcon('black')).setOpacity(1);
            } else {
              (l as L.Marker).setIcon(ziekenhuisIcon).setOpacity(0.3);
            }
            i++;
          });
        }
        return { app: { hospitals } };
      },
      updateActiveLayers: async (layer: string, add: boolean) => {
        const { app } = states();
        const { activeLayers, selectedHospital } = app;
        if (add) {
          activeLayers!.add(layer);
        } else {
          activeLayers!.delete(layer);
        }
        console.log(activeLayers);
        if (add) {
          if (!selectedHospital || (selectedHospital.properties && !selectedHospital.properties.Locnr)) {
            console.warn('No item active, so cannot load data. Please select a feature first.');
          } else {
            const result = await loadGeoJSON(layer, selectedHospital, app);
            update({ app: { activeLayers, ...result } });
          }
        } else {
          update({ app: { activeLayers } });
        }
      },
      refreshLayer: async (layer?: string) => {
        const { app } = states();
        const { selectedHospital } = app;
        if (!selectedHospital || !layer) return;
        const result = await loadGeoJSON(layer, selectedHospital, app);
        update({ app: { ...result } });
      },
    } as IAppStateActions;
  },
} as IAppState;

const loadGeoJSON = async (layer: string, selectedHospital: Feature, app: { [key: string]: L.GeoJSON }) => {
  const layerName = layer + 'Layer';
  const id = (selectedHospital.properties as any).Locnr;
  const geojson = app[layerName] ? (app[layerName] as L.GeoJSON) : undefined;
  if (geojson) {
    const record = await m.request<{ id: number; data: FeatureCollection }>({
      method: 'GET',
      //url: `${process.env.SERVER || 'http://localhost:3366/api/'}${layer}/id/${id}`,
      url: `${process.env.SERVER || 'http://163.158.64.118:3366/api/'}${layer}/id/${id}`,
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
