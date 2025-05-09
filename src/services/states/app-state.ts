// console.log('app-state.ts')
// console.log('imported Chart and chart elements')
// console.log('registered Chart elements')

import Stream from 'mithril/stream';
import { IAppModel, UpdateStream } from '../meiosis';
import { FeatureCollection, Feature, Point, LineString, Polygon } from 'geojson';
import { actions } from '..';
import L, { LatLng, MarkerClusterGroup } from 'leaflet';

// under the ./src folder
import { NamedGeoJSONOptions } from '../../components';
import { activeLayersAsString, isCareLayer, isCureLayer, isSportLayer,
         isTEOLayer, isVattenfallLayer, isWZVLayer } from '../../components/utils_rs';
import { highlightMarker, 
       // pointToGrayCircleMarkerLayer,
       //  pointToGreenCircleMarkerLayer, 
       //  pointToYellowCircleMarkerLayer 
       } from '../../components/markers'
import { get_nearest_province } from '../../services/provinces';
import { createMCG, loadMCG, createLayerTVW, createLayerVF, createLayerWZV, createLeafletLayer, 
         loadGeoJSON, loadGeoJSON_VF, loadGeoJSON_WZV } from '../../models/layer_generators';

// layer data:
import categorale_instellingen from '../../data/categorale instellingen.json';
import effluent from '../../data/Syntraal_effluent.json';
import ggz from '../../data/ggz.json';
import ghz from '../../data/ghz.json';
// import rioolleidingen: loaded dynamically. see rioolleidingenLayer
import gl_wk_bu from '../../data/gasloze wijken en buurten.json';
import poliklinieken from '../../data/poliklinieken.json';
import rwzis from '../../data/Syntraal_rwzis.json';
import schoolsNPO from '../../data/scholen_NPO.json';
import schoolsPO from '../../data/scholen_PO.json';
import skatings from '../../data/ijsbanen.json';
import sports from '../../data/sport.json';
import swimmings from '../../data/zwembaden.json';
import tvw from '../../data/tvw_shapes.json';
import vvt from '../../data/vvt.json';
// wateren_potentie_gt1haLayer: loaded dynamically. see wateren_potentie_gt1haLayer
import warmtenetten_nbr_lokaal from '../../data/lokale_warmtenetten_20200519.json';
import warmtenetten_nbr_infra from '../../data/infrastructuur_warmte.json';
// // wko point layers
import wko_gwi from '../../data/WKO_GWI.json';
import wko_gwio from '../../data/WKO_GWIO.json';
// import wko_gwo: loaded dynamically. see wko_gwoLayer
// import wko_gbes: loaded dynamically. see wko_gbesLayer
import wko_obes from '../../data/WKO_OBES.json';
// import wko_installaties: loaded dynamically. see wko_installatiesLayer
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

// these functions couldn't be moved to markers.ts:

const pointToGrayCircleMarkerLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  const marker = new L.CircleMarker(latlng, {
    radius: 10,
    stroke: false,
    fillColor: 'gray',
    fillOpacity: 0.6,
  });
  feature.properties && feature.properties.PC6 && marker.bindTooltip(feature.properties.PC6);
  return marker;
}; // pointToGrayCircleMarkerLayer

const pointToGreenCircleMarkerLayer = (_feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    stroke: false,
    fillColor: 'green',
    fillOpacity: 0.8,
  });
}; // pointToGreenCircleMarkerLayer

const pointToYellowCircleMarkerLayer = (_feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    weight: 1,
    color: 'orange',
    fillColor: 'yellow',
    fillOpacity: 0.8,
  });
}; // pointToYellowCircleMarkerLayer


/** Application state */
export interface IAppStateModel {
  app: Partial<{
    /* overlay layers: */
    categorale_instellingen: FeatureCollection<Point>;
    effluent: FeatureCollection;
    ggz: FeatureCollection<Point>;
    ggzLayer: MarkerClusterGroup;
    ghz: FeatureCollection<Point>;
    ghzLayer: MarkerClusterGroup;
    gl_wk_bu: FeatureCollection;
    poliklinieken: FeatureCollection<Point>;
    rioolleidingenLayer: L.GeoJSON;
    rwzis: FeatureCollection<Point>;
    schoolsNPO: MarkerClusterGroup;
    schoolsPO: MarkerClusterGroup;
    skatings: FeatureCollection;
    sports: MarkerClusterGroup;
    swimmings: FeatureCollection;
    tvw: L.GeoJSON;
    vvt: FeatureCollection<Point>;
    vvtLayer: MarkerClusterGroup;
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
    wzvLayer: L.GeoJSON;
    ziekenhuizen: FeatureCollection<Point>;
    // other state variables:
    activeLayers: Set<string>;         // Layers that are loaded
    chartsShown: boolean;              // are the charts shown
    selectedCharts: string;            // comma separated chart names => make this a Set<string>?
    selectedHospital: Feature<Point>;  // (deprecated?)
    selectedItem: Feature<Point>;      // Last item that was clicked
    selectedLayer: string;             // Last item's layer name
    selectedMarkersLayer: L.GeoJSON;   // Layer with selected markers 
    selectedProvince: string;          // Currently selected province (for charts)
    //showMain_BranchOnly: boolean;       // for the Care layers
    size: number;                      // Bounding box size  (deprecated?)
    teoActive: boolean;                // is the TEO layer active
    treeCollapsed: boolean;            // is the layer tree collapsed
    zoom: -1;                          // the current zoom level
    [key: string]: L.GeoJSON | any;
  }>;
}

export interface IAppStateActions {
  handleChartSelect: (evt: Event) => void;
  handleMoveEnd: (ll: LatLng, zoom: number) => void;
  mapClick: () => void;
  refreshLayer: (layer?: string) => Promise<void>;
  selectFeature: (f: Feature<Point | LineString | Polygon>, layerName?: string, layer?: L.Layer) => void;
  selectHospital: (f: Feature<Point>, layerName?: string) => Promise<void>;
  setZoomLevel: (zoom: number) => void;
  toggleChartsShown: () => boolean;
  //toggleMain_BranchOnly: () => boolean;
  toggleTreeCollapsed: () => boolean;
  updateActiveLayers: (layer: string, add: boolean) => Promise<void>;
  setSelectedProvince: (provinceName: string) => void;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}

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
      categorale_instellingen,
      effluent,
      ggz,
      ggzLayer: createMCG('ggz', 3),
      ghz,
      ghzLayer: createMCG('ghz', 2),
      gl_wk_bu,
      poliklinieken,
      rwzis,
      rioolleidingenLayer: L.geoJSON(undefined, {
        onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
          layer.on('click', (e) => {
            actions.selectFeature(feature as Feature<Point>, e.target?.options?.name, layer);
          });
        },
        name: 'rioolleidingen',
      } as NamedGeoJSONOptions),
      schoolsNPOLayer: createMCG('schoolsNPO', 4),
      schoolsPOLayer: createMCG('schoolsPO', 4),
      skatings,
      sportsLayer: createMCG('sports', 5),
      swimmings,
      tvwLayer: createLayerTVW('tvw', 'TVW_status', tvw),
      vvt,
      vvtLayer: createMCG('vvt', 1),
      warmtenetten_nbr_lokaal,
      warmtenetten_nbr_infra,
      wateren_potentie_gt1haLayer: createLeafletLayer('wateren_potentie_gt1ha', 'AVGwocGJ_1'),
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
      wn_vf_almereLayer: createLayerVF('wn_vf_almere', 'NETTYPE', undefined),
      wn_vf_amsterdamLayer: createLayerVF('wn_vf_amsterdam', 'NETTYPE', undefined),
      wn_vf_arnhemLayer: createLayerVF('wn_vf_arnhem', 'NETTYPE', undefined),
      wn_vf_edeLayer: createLayerVF('wn_vf_ede', 'NETTYPE', undefined),
      wn_vf_leidenLayer: createLayerVF('wn_vf_leiden', 'NETTYPE', undefined),
      wn_vf_lelystadLayer: createLayerVF('wn_vf_lelystad', 'NETTYPE', undefined),
      wn_vf_nijmegenLayer: createLayerVF('wn_vf_nijmegen', 'NETTYPE', undefined),
      wn_vf_rotterdamLayer: createLayerVF('wn_vf_rotterdam', 'NETTYPE', undefined),
      wn_vf_vlielandLayer: createLayerVF('wn_vf_vlieland', 'NETTYPE', undefined),
      wzvLayer: createLayerWZV('wzv', 'status', undefined),
      ziekenhuizen,

      activeLayers: new Set(),
      chartsShown: false,
      selectedCharts: '',
      selectedMarkersLayer: L.geoJSON(undefined),
      selectedProvince: 'Gelderland',
      // showMain_BranchOnly: true,
      teoActive: false,
    },
  } as IAppStateModel,

  actions: (update, states): IAppStateActions => {
    return {
      handleChartSelect: (evt: Event) => {
        // console.log(`handleChartSelect: sel.currentTarget.length = ${evt.currentTarget.length}`)
        var selectedCharts = ''
        for (let i = 0; i < evt.currentTarget.length; i++ ) {
          let opt = evt.currentTarget[i]
          // console.log(`i = ${i}; opt = ${opt.value}`)
          if (opt.selected) { selectedCharts = selectedCharts + opt.value + ',' }
        }
        // console.log(`handleChartSelect: selectedCharts = ${selectedCharts}`)
        update({ app: { selectedCharts } });
      },

      handleMoveEnd: (lalo: LatLng, zoom: number) => {
        //console.log(`after move: lat=${lalo.lat}, long=${lalo.lng}, zoom=${zoom}`);
        let np = ''
        // if (zoom >= 10) {
          np = get_nearest_province(lalo);
        // }
        console.log(`Nearest province: ${np}`);
        update({ app: { selectedProvince: np } });
      },

      mapClick: () => {
        const {
          app: { selectedLayer },
          // app: { selectedLayer, selectedMarkersLayer },
        } = states();
        console.log(`mapclick. selectedLayer=${selectedLayer}`);
        // if (selectedLayer && !isTEOLayer(selectedLayer)) {
        //   selectedMarkersLayer!.clearLayers();
        //   // var new_sl = selectedLayer;
        //   // if (isCareOrCureLayer(new_sl!) || isSportLayer(new_sl!) !! teoActive ) {
        //   //   // new_sl = undefined    // if setting it to undefined, the legend disappears
        //   //   // console.log('mapclick calling update()');
        //   //   update({ app: { selectedItem: undefined, selectedLayer: new_sl, selectedHospital: undefined } });
        //   // };
        //   update({ app: { selectedItem: undefined, selectedHospital: undefined } });
        // }
      },

      refreshLayer: async (layer?: string) => {
        // console.log('refreshLayer. layer: ' + layer)
        const { app } = states();
        const { selectedHospital } = app;
        if (!selectedHospital || !layer) return;
        const result = await loadGeoJSON(layer, selectedHospital, app);
        update({ app: { ...result } });
      },

      selectFeature: async (f, selectedLayer?: string, layer?: L.Layer) => {
        // console.log(`Select feature. selectedLayer: ${selectedLayer}`);
        // console.log(`Selected feature: ${f}`);
        const {
          app: { selectedMarkersLayer, ggz, ghz, vvt },
        } = states();
        if (highlightedLayer && highlightedLayer.setStyle) {
          // console.log(`Select feature. if block (highlightedLayer is assigned)`);
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
          // console.log(`Select feature. else block (no highlightedLayer)`);
          if (selectedMarkersLayer) {
            if (!isTEOLayer(selectedLayer!)) {
              selectedMarkersLayer.clearLayers();
              selectedMarkersLayer.bringToBack();
            }
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
          };
        }
        update({ app: { selectedItem: () => f, selectedLayer, selectedHospital: undefined } });
      }, // selectFeature

      selectHospital: async (f, layerName: string) => {
        // console.log('Select hospital (cure location); layerName = ' + layerName);
        const { app } = states();
        const { activeLayers, selectedHospital, selectedMarkersLayer, categorale_instellingen, poliklinieken, ziekenhuizen } = app;
        var sActiveLayers = activeLayersAsString(activeLayers!);  // trailing comma and space are not removed (not necessary)
        if (selectedHospital && selectedHospital.properties?.Locatienummer === f.properties?.Locatienummer) return;
        const updating = [] as Array<Promise<{ [key: string]: L.GeoJSON }>>;
        activeLayers?.forEach((layer) => {
          if (!isCareLayer(layer)) {
            updating.push(loadGeoJSON(layer, f, app));
          }
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
      }, // selectHospital

      setSelectedProvince: (selectedProvince: string) => {
        // if (['Limburg', 'Zeeland'].indexOf(selectedProvince) < 0) return;
        console.log(`setSelectedProvince: ${selectedProvince}`);
        update({ app: { selectedProvince }});
      },

      setZoomLevel: (zoom: number) => update({ app: { zoom } }),

      toggleChartsShown: () => {
        console.log('toggleChartsShown');
        const { app } = states();
        const { chartsShown } = app;
        const new_value = chartsShown == undefined ? true : !chartsShown;
        console.log(`toggleChartsShown: new_value = ${new_value}`);
        update({ app: { chartsShown: new_value } });
        return new_value
      },

      // toggleMain_BranchOnly: () => {
      //   console.log('toggleMain_BranchOnly');
      //   const { app } = states();
      //   const { activeLayers, ggzLayer, ghzLayer, showMain_BranchOnly, vvtLayer } = app;
      //   const new_value = showMain_BranchOnly == undefined ? true : !showMain_BranchOnly;
      //   console.log(`toggleMain_BranchOnly: new_value = ${new_value}`);
      //   const sActiveLayers = activeLayersAsString(activeLayers!);
      //   var new_ggzLayer = ggzLayer;
      //   if (sActiveLayers.includes('ggz')) {
      //     new_ggzLayer = loadMCG(ggzLayer, ggz, new_value)
      //   }
      //   var new_ghzLayer = ghzLayer;
      //   if (sActiveLayers.includes('ghz')) {
      //     new_ghzLayer = loadMCG(ghzLayer, ghz, new_value)
      //   }
      //   var new_vvtLayer = vvtLayer;
      //   if (sActiveLayers.includes('vvt')) {
      //     new_vvtLayer = loadMCG(vvtLayer, vvt, new_value)
      //   }
      //   update({ app: { ggzLayer: new_ggzLayer, ghzLayer: new_ghzLayer,
      //                   showMain_BranchOnly: new_value, vvtLayer: new_vvtLayer } });
      //   return new_value
      // },

      toggleTreeCollapsed: () => {
        // console.log('toggleTreeCollapsed');
        const { app } = states();
        const { treeCollapsed } = app;
        const new_value = treeCollapsed == undefined ? true : !treeCollapsed;
        console.log(`toggleTreeCollapsed: new_value = ${new_value}`);
        update({ app: { treeCollapsed: new_value } });
        return new_value
      },

      updateActiveLayers: async (selectedLayer: string, add: boolean) => {
        // console.log(`updateActiveLayers; selectedLayer=${selectedLayer}`)
        const { app } = states();
        const { ggzLayer,
                ghzLayer,
                vvtLayer,
                schoolsNPOLayer,
                schoolsPOLayer,
                sportsLayer,
                activeLayers, 
                selectedHospital: old_sH,
                selectedLayer: old_sL, 
                selectedMarkersLayer,
                // showMain_BranchOnly,
                teoActive: old_tA } = app;
        // console.log(`old_sl=${old_sl}; activeLayers=${activeLayersAsString(activeLayers!)}`)

        // care layers: update if the showMain_BranchOnly state or the legend checkbox states have changed 
        // (it is not checked whether there was a change; the layers are just reloaded)
        var new_ggzLayer = ggzLayer
        var new_ghzLayer = ghzLayer
        var new_vvtLayer = vvtLayer
        if (selectedLayer === 'vvt' || selectedLayer === 'ggz' || selectedLayer === 'ghz') { 
          new_vvtLayer = loadMCG(vvtLayer, vvt, true /*showMain_BranchOnly*/);
          new_ggzLayer = loadMCG(ggzLayer, ggz, true /*showMain_BranchOnly*/);
          new_ghzLayer = loadMCG(ghzLayer, ghz, true /*showMain_BranchOnly*/);
        }
        var new_schoolsNPOLayer = schoolsNPOLayer
        if (selectedLayer === 'schoolsNPO') {
          new_schoolsNPOLayer = loadMCG(schoolsNPOLayer, schoolsNPO, false)
        };
        var new_schoolsPOLayer = schoolsPOLayer
        if (selectedLayer === 'schoolsPO') {
          new_schoolsPOLayer = loadMCG(schoolsPOLayer, schoolsPO, false)
        };
        var new_sportsLayer = sportsLayer
        if (selectedLayer === 'sports') {
          new_sportsLayer = loadMCG(sportsLayer, sports, false)
        };

        if ( isVattenfallLayer(selectedLayer) && add ) {
          const result = await loadGeoJSON_VF(selectedLayer, app);
        } else {
          // console.log('NOT calling loadGeoJSON_VF');
        };

        if ( isWZVLayer(selectedLayer) && add ) {
          const result = await loadGeoJSON_WZV(selectedLayer, app);
        };

        var new_sL = old_sL;  // can be overruled later on
        var new_sH = old_sH;
        var new_tA = old_tA;
        if (add) {
          activeLayers!.add(selectedLayer);
          new_sL = selectedLayer;
          if (isTEOLayer(selectedLayer)) { new_tA = true }
        } else {
          activeLayers!.delete(selectedLayer);
          if (isTEOLayer(selectedLayer)) { new_tA = false }
          if (old_sL === selectedLayer) selectedMarkersLayer?.clearLayers();
        };

        if (!isCureLayer(selectedLayer) && !new_tA) new_sH = undefined;
        // console.log(activeLayers);
        if (add && new_sH && new_sH.properties && new_sH.properties.Locatienummer) {
          const result = await loadGeoJSON(selectedLayer, new_sH, app);
          update({ app: { activeLayers, selectedLayer: new_sL, selectedHospital: new_sH, teoActive: new_tA, ...result } });
        } else {
          update({ app: { activeLayers, selectedLayer: new_sL, selectedHospital: new_sH, teoActive: new_tA } });
        };
        return
      }, // updateActiveLayers
    } as IAppStateActions;
  },
} as IAppState;
