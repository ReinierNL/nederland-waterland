import m from 'mithril';
import Stream from 'mithril/stream';
import { IAppModel, UpdateStream } from '../meiosis';
import ziekenhuizen from '../../data/ziekenhuizen.json';
import ggz from '../../data/ggz.json';
import ghz from '../../data/ghz.json';
import vvt from '../../data/vvt.json';
import rwzis from '../../data/Syntraal_rwzis.json';
import effluent from '../../data/Syntraal_effluent.json';
// import rioolleidingen:  loaded dynamically. see rioolleidingenLayer
import gl_wk_bu from '../../data/gasloze wijken en buurten.json';
import poliklinieken from '../../data/poliklinieken.json';
import skatings from '../../data/ijsbanen.json';
import swimmings from '../../data/zwembaden.json';
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
// import wko_natuur: loaded dynamcally. see wko_natuurLayer
import wko_ordening from '../../data/WKO Restrictie Ordening.json';
// import wko_specprovbeleid: loaded dynamcally. see wko_spec_prov_beleidLayer
import wko_verbod from '../../data/WKO Verbodsgebieden.json';
import { createIcon, ziekenhuisIcon } from '../../utils';
import { FeatureCollection, Feature, Point, GeoJsonObject, Polygon } from 'geojson';
import { actions } from '..';
import L, { LeafletEvent } from 'leaflet';
import { NamedGeoJSONOptions } from '../../components';
import { toColorFactory, toFilterFactory } from '../../models';
import { isCareOrCureLayer, isSportLayer } from '../../components/utils_rs';

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
    poliklinieken: FeatureCollection<Point>;
    rioolleidingenLayer: L.GeoJSON;
    rwzis: FeatureCollection<Point>;
    skatings: FeatureCollection;
    swimmings: FeatureCollection;
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
  selectFeature: (f: Feature<Point | Polygon>, layerName?: string, layer?: L.Layer) => void;
  selectHospital: (f: Feature<Point>) => Promise<void>;
  toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => void;
  updateActiveLayers: (layer: string, add: boolean) => Promise<void>;
  refreshLayer: (layer?: string) => Promise<void>;
  setZoomLevel: (zoom: number) => void;
  toggleRoutekaartActivity: () => Promise<void>; 
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}
const size = 5000;

const highlightMarker = (selectedMarkersLayer: L.GeoJSON, f: Feature, primarySelection = true) => {
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
};

const pointToTitledLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  // intended purpose: let the feature have a title that is shown when mouse is hovered over the feature
  // but.. it doesn't seem to work
  // this works for the hospital layer and the rwzis, but not for the water potential layer
  // which is created by createLeafletLayer. perhaps because it is not a point layer
  return new L.Marker(latlng, {
    title: feature.properties.Name
      ? feature.properties.Name
      : feature.properties.Naam
      ? feature.properties.Naam
      : feature.properties.NAAM
      ? feature.properties.NAAM
      : '',
  });
};

const createLeafletLayer = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  const getColor = toColorFactory(name, legendPropName);
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
      size,
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
      poliklinieken,
      ziekenhuizen,
      isSearching: false,
      searchQuery: '',
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
          new_sl = undefined
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
          const organisatie = f.properties?.['KvK-nummer_van_het_concern_DigiMV_2012'] || f.properties?.Organisatie;
          if (organisatie && !/onbekend/i.test(organisatie)) {
            const overlay =
              selectedLayer === 'ggz' ? ggz : selectedLayer === 'ghz' ? ghz : selectedLayer === 'vvt' ? vvt : undefined;
            const id = f.properties?.Id;
            overlay &&
              overlay.features
                .filter(
                  (z) =>
                    z.properties?.['KvK-nummer_van_het_concern_DigiMV_2012'] === organisatie ||
                    z.properties?.Organisatie === organisatie
                )
                .forEach((z) => highlightMarker(selectedMarkersLayer, z, z.properties?.Id === id));
          } else {
            highlightMarker(selectedMarkersLayer, f);
          }
        }
        update({ app: { selectedItem: () => f, selectedLayer, selectedHospital: new_sh } });
      },
      selectHospital: async (f) => {
        console.log('Select hospital');
        const { app } = states();
        const { activeLayers, selectedHospital, selectedMarkersLayer, ziekenhuizen } = app;
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
        if (selectedMarkersLayer && ziekenhuizen) {
          selectedMarkersLayer.clearLayers();
          selectedMarkersLayer.bringToBack();
          const id = f.properties?.Locatienummer;
          const organisatie = f.properties?.Organisatie;
          organisatie &&
            ziekenhuizen.features
              .filter((z) => z.properties && z.properties.Organisatie === organisatie)
              .forEach((z) => highlightMarker(selectedMarkersLayer, z, z.properties?.Locatienummer === id));
        }
        update({
          app: { selectedHospital: () => f, selectedLayer: 'ziekenhuizen', selectedItem: undefined, ...result },
        });
      },
      toggleHospitalActivity: (id: number, layer?: L.GeoJSON) => {
        const {
          app: { hospitals },
        } = states();
        if (!hospitals) return;
        hospitals.features.some((h: Feature<Point, { id: number; active: boolean }>) => {
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
      updateActiveLayers: async (selectedLayer: string, add: boolean) => {
        console.log('updateActiveLayers')
        const { app } = states();
        const { activeLayers, selectedHospital: old_sh, selectedLayer: old_sl, selectedMarkersLayer } = app;
        var new_sh = old_sh;
        if (add) {
          activeLayers!.add(selectedLayer);
        } else {
          activeLayers!.delete(selectedLayer);
          if (old_sl === selectedLayer) selectedMarkersLayer?.clearLayers();
          selectedLayer = ''
        }
        if (selectedLayer != 'ziekenhuizen') new_sh = undefined;
        // console.log(activeLayers);
        if (add && new_sh && new_sh.properties && new_sh.properties.Locatienummer) {
          const result = await loadGeoJSON(selectedLayer, new_sh, app);
          update({ app: { activeLayers, selectedLayer, selectedHospital: new_sh, ...result } });
        } else {
          update({ app: { activeLayers, selectedLayer, selectedHospital: new_sh } });
        }
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
      }
    } as IAppStateActions;
  },
} as IAppState;

const loadGeoJSON = async (layer: string, selectedHospital: Feature, app: { [key: string]: L.GeoJSON }) => {
  const layerName = layer + 'Layer';
  const id = (selectedHospital.properties as any).Locatienummer;
  const geojson = app[layerName] ? (app[layerName] as L.GeoJSON) : undefined;
  if (geojson) {
    console.log(`process.env.GIS_SERVER: ${process.env.GIS_SERVER}`)
    const record = await m.request<{ id: number; data: FeatureCollection }>({
      method: 'GET',
      // url: `${process.env.SERVER || 'http://localhost:3366/api/'}${layer}/id/${id}`,
      // url: `${process.env.GIS_SERVER || 'http://163.158.64.118:3366/api/'}${layer}/id/${id}`,
      // url: `${process.env.SERVER || 'https://assistance.hex.tno.nl/geojson-server/api/'}${layer}/id/${id}`,
      url: `${process.env.SERVER || 'https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/geojson-server/api/'}${layer}/id/${id}`,
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
