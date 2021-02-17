import m from 'mithril';
import Stream from 'mithril/stream';
import { IAppModel, UpdateStream } from '../meiosis';
import { IZiekenhuis } from '../../models/ziekenhuis';
import ziekenhuizen from '../../data/ziekenhuizen.json';
import ziekenhuizen2019 from '../../data/ziekenhuizen2019.json';
import verzorgingshuizen from '../../data/verzorgingshuizen.json';
import ziekenhuizen_rk from '../../data/ziekenhuizen_routekaarten.json';
import ggz from '../../data/ggz.json';
import ghz from '../../data/ghz.json';
import vvt from '../../data/vvt.json';
// import rwzis from '../../data/Syntraal_rwzis.json';
// import effluent from '../../data/Syntraal_effluent.json';
// import rioolleidingen from '../../data/Syntraal_rioolleidingen.json'; // cannot parcel  (out of memory)
// import rioolleidingen from '../../data/Syntraal_effluent.json';
// import gl_wk_bu from '../../data/gasloze wijken en buurten.json';
// wko point layers
// import wko_gwi from '../../data/WKO_GWI.json';
// import wko_gwio from '../../data/WKO_GWIO.json';
// import wko_gwo from '../../data/WKO_GWI.json'; // cannot parcel WKO_GWI.JSON (out of memory)
// import wko_gbes from '../../data/WKO_GWI.json'; //loading takes too long
// import wko_obes from '../../data/WKO_OBES.json';
// // wko restriction layers
// import wko_diepte from '../../data/WKO Restrictie Diepte.json';
// //import wko_natuur from '../../data/WKO Restrictie Natuur.json';  # cannot parcel  (out of memory)
// import wko_natuur from '../../data/WKO Restrictie Ordening.json';
// import wko_ordening from '../../data/WKO Restrictie Ordening.json';
// //import wko_specprovbeleid from '../../data/WKO Restrictie SpecProvBeleid.json'; # cannot parcel  (out of memory)
// import wko_specprovbeleid from '../../data/WKO Restrictie Ordening.json';
// import wko_verbod from '../../data/WKO Verbodsgebieden.json';
import { createBoundingBox, createIcon, processWater, ziekenhuisIconX } from '../../utils';
import { FeatureCollection, Feature, Point } from 'geojson';
import { actions, top10nl } from '..';
import L from 'leaflet';
import { NamedGeoJSONOptions } from '../../components';

// Add curline        // (RS): What is curline??
ziekenhuizen.features = ziekenhuizen.features.map((z: any) => ({
  ...z,
  properties: {
    ...z.properties,
    active: true,
  },
}));

ziekenhuizen2019.features = ziekenhuizen2019.features.map((z: any) => ({
  ...z,
  properties: {
    ...z.properties,
    active: true,
  },
}));

/** Application state */

export interface IAppStateModel {
  app: Partial<{
    water?: FeatureCollection;
    vvt: FeatureCollection<Point>;
    ggz: FeatureCollection<Point>;
    ghz: FeatureCollection<Point>;
    wateren_potentie_gt1haLayer: L.GeoJSON;
    rwzis: FeatureCollection<Point>;
    effluent: FeatureCollection;
    rioolleidingen: FeatureCollection;
    gl_wk_bu: FeatureCollection;
    wko_gwi: FeatureCollection;
    wko_gwio: FeatureCollection;
    wko_gwo: FeatureCollection;
    wko_gbes: FeatureCollection;
    wko_obes: FeatureCollection;
    wko_diepte: FeatureCollection;
    wko_natuur: FeatureCollection;
    wko_ordening: FeatureCollection;
    wko_specprovbeleid: FeatureCollection;
    wko_verbod: FeatureCollection;
    /** Bounding box size */
    size: number;
    selectedItem: Feature<Point>;
    selectedHospital: Feature<Point>;
    selectedWaterItem: Feature;
    verzorgingshuizen: FeatureCollection<Point>;
    hospitals: FeatureCollection<Point, IZiekenhuis>;
    ziekenhuizen2019: FeatureCollection<Point>;
    ziekenhuizen_rk: FeatureCollection<Point>;
    /** Layers that are loaded */
    activeLayers: Set<string>;
    [key: string]: L.GeoJSON | any;
  }>;
}

export interface IAppStateActions {
  selectFeature: (f: Feature<Point>) => void;
  selectHospital: (f: Feature<Point>) => Promise<void>;
  selectWaterFeature: (f: Feature) => void;
  toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => void;
  setBoundingBoxSizeInMeter: (size: number) => void;
  updateActiveLayers: (layer: string, add: boolean) => Promise<void>;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}
const size = 5000;
export const appStateMgmt = {
  initial: {
    app: {
      size,
      vvt,
      ggz,
      ghz,
      // wateren,
      // rwzis,
      // effluent,
      // rioolleidingen,
      // gl_wk_bu,
      // wko_gwi,
      // wko_gwio,
      // wko_gwo,
      // wko_gbes,
      // wko_obes,
      // wko_diepte,
      // wko_natuur,
      // wko_ordening,
      // wko_specprovbeleid,
      // wko_verbod,
      wateren_potentie_gt1haLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
          layer.on('click', () => {
            actions.selectFeature(feature as Feature<Point>);
          });
        },
        name: 'wateren_potentie_gt1ha',
      } as NamedGeoJSONOptions),
      verzorgingshuizen,
      ziekenhuizen_rk,
      ziekenhuizen2019,
      hospitals: ziekenhuizen as GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>,
      baseline: (ziekenhuizen as GeoJSON.FeatureCollection<GeoJSON.Point, IZiekenhuis>).features.reduce(
        (acc, cur) => {
          return [acc[0] + cur.properties.t25, acc[1] + cur.properties.t30, acc[2] + cur.properties.tOv] as [
            number,
            number,
            number
          ];
        },
        [0, 0, 0] as [number, number, number]
      ),
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
      selectFeature: async (f) => {
        // const {
        //   app: { size = 5000 },
        // } = states();
        // const lng = f.geometry.coordinates[0];
        // const lat = f.geometry.coordinates[1];
        // const bbox = createBoundingBox(lat, lng, size);
        // const geojson = await top10nl(bbox);
        // const geojson = await overpass(bbox);
        // update({ app: { selectedItem: () => f, water: processWater(lat, lng, geojson) } });
        update({ app: { selectedItem: () => f } });
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
        update({ app: { selectedHospital: () => f, ...result } });
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
              (l as L.Marker).setIcon(ziekenhuisIconX).setOpacity(0.3);
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
      url: `${process.env.SERVER || 'http://localhost:3366/api/'}${layer}/id/${id}`,
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
