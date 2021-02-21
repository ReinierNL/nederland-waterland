import m from 'mithril';
import L, { GeoJSONOptions, ILayerTree } from 'leaflet';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';
import 'leaflet.control.layers.tree';
import 'leaflet/dist/leaflet.css';
// import 'leaflet-hash';
import {
  verzorgingstehuisIcon,
  sewageIcon,
  ziekenhuisIcon,
} from '../utils';
import { IZiekenhuis } from '../models/ziekenhuis';
import { MeiosisComponent } from '../services/meiosis';
import { InfoPanel } from './info-panel';
import { Feature, Point } from 'geojson';
import { Legend } from './legend';

export interface NamedGeoJSONOptions<P = any> extends GeoJSONOptions<P> {
  name: string;
}

export const HomePage: MeiosisComponent = () => {
  let map: L.Map;
  let ziekenhuizen_rkLayer: L.GeoJSON;
  let ziekenhuizen_v3Layer: L.GeoJSON;
  let verzorgingshuizenLayer: L.GeoJSON;
  let vvtLayer: L.GeoJSON;
  let ggzLayer: L.GeoJSON;
  let ghzLayer: L.GeoJSON;
  //let wateren_potentie_gt1haLayer: L.GeoJSON; // dynamic
  let rwzisLayer: L.GeoJSON;
  let effluentLayer: L.GeoJSON;
  //let rioolleidingenLayer: L.GeoJSON; // dynamic
  let gl_wk_buLayer: L.GeoJSON;
  let wko_gwiLayer: L.GeoJSON;
  let wko_gwioLayer: L.GeoJSON;
  let wko_gwoLayer: L.GeoJSON;
  let wko_gbesLayer: L.GeoJSON;
  let wko_obesLayer: L.GeoJSON;
  //let wko_installatiesLayer: L.GeoJSON; // dynamic
  let wko_diepteLayer: L.GeoJSON;
  //let wko_natuurLayer: L.GeoJSON; // dynamic
  let wko_ordeningLayer: L.GeoJSON;
  //let wko_specprovbeleidLayer: L.GeoJSON; // dynamic
  let wko_verbodLayer: L.GeoJSON;
  // let selectedHospitalLayer: L.Marker;

  return {
    view: ({ attrs: { state, actions } }) => {
      console.log(state);
      const {
        selectedItem,
        selectedHospital,
        selectedWaterItem,
        wateren_potentie_gt1haLayer,
        ziekenhuizen_v3,
        verzorgingshuizen,
        ggz,
        ghz,
        vvt,
        ziekenhuizen_rk,
        rwzis,
        effluent,
        rioolleidingenLayer,
        gl_wk_bu,
        wko_gwi,
        wko_gwio,
        wko_gwo,
        wko_gbes,
        wko_obes,
        wko_installatiesLayer,
        wko_diepte,
        wko_natuurLayer,
        wko_ordening,
        wko_specprovbeleidLayer,
        wko_verbod,
      } = state.app;

      const { updateActiveLayers } = actions;

      const waterProps = selectedWaterItem && selectedWaterItem.properties;
      // console.table(waterProps);
      return [
        m(
          '.container',
          { style: 'position: fixed;' },
          m('#map', {
            style:
              'height: 100vh; width: 70vw; margin: 0; padding: 0; overflow: hidden; box-shadow: (0px 0px 20px rgba(0,0,0,.3))',
            oncreate: () => {
              map = L.map('map', {}).setView([52.14, 5.109], 8);
              map.on('overlayadd', (e: any) => updateActiveLayers(e.layer.options.name, true));
              map.on('overlayremove', (e: any) => updateActiveLayers(e.layer.options.name, false));
              L.control.scale({ imperial: false, metric: true }).addTo(map);
              // Add the PDOK map
              const pdokachtergrondkaartGrijs = new L.TileLayer(
                'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaartgrijs/EPSG:3857/{z}/{x}/{y}.png',
                {
                  minZoom: 3,
                  maxZoom: 18,
                  attribution: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
                }
              );
              // pdokachtergrondkaartGrijs.addTo(map);
              const pdokachtergrondkaart = new L.TileLayer(
                'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaart/EPSG:3857/{z}/{x}/{y}.png',
                {
                  minZoom: 3,
                  maxZoom: 18,
                  // tms: true,
                  attribution: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
                }
              );
              pdokachtergrondkaart.addTo(map);
              // Hash in URL
              // new (L as any).Hash(map);

              const pointToCircleMarkerLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
                return new L.CircleMarker(latlng, {
                  radius: 5,
                  stroke: false,
                  fillColor: 'green',
                  fillOpacity: 0.8,
                });
              };

              const pointToLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
                return new L.Marker(latlng, {
                  icon: verzorgingstehuisIcon,
                  title: feature.properties.Name,
                });
              };

              const pointToSewageLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
                return new L.Marker(latlng, {
                  icon: sewageIcon,
                  title: feature.properties.Name,
                });
              };

              const pointToZHv3Layer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
                return new L.Marker(latlng, {
                  icon: ziekenhuisIcon,
                  title: feature.properties.Name,
                });
              };

              const onEachFeature = (feature: Feature<Point, any>, layer: L.Layer) => {
                layer.on('click', () => {
                  actions.selectFeature(feature as Feature<Point>);
                });
              };

              vvtLayer = L.geoJSON(vvt, { pointToLayer, onEachFeature, name: 'vvt' } as NamedGeoJSONOptions);
              ghzLayer = L.geoJSON(ghz, { pointToLayer, onEachFeature, name: 'ghz' } as NamedGeoJSONOptions);
              ggzLayer = L.geoJSON(ggz, { pointToLayer, onEachFeature, name: 'ggz' } as NamedGeoJSONOptions);

              rwzisLayer = L.geoJSON(rwzis, {
                pointToLayer: pointToSewageLayer,
                onEachFeature,
                name: 'rwzis',
              } as NamedGeoJSONOptions);
              effluentLayer = L.geoJSON(effluent, {
                pointToLayer,
                onEachFeature,
                name: 'effluent',
              } as NamedGeoJSONOptions);
              // rioolleidingenLayer : dyamic layer, declared in app-state (as part of state)
              gl_wk_buLayer = L.geoJSON(gl_wk_bu, {
                pointToLayer,
                onEachFeature,
                name: 'gl_wk_bu',
              } as NamedGeoJSONOptions);
              wko_gwiLayer = L.geoJSON(wko_gwi, {
                pointToLayer: pointToCircleMarkerLayer,
                onEachFeature,
                name: 'wko_gwi',
              } as NamedGeoJSONOptions);
              wko_gwioLayer = L.geoJSON(wko_gwio, {
                pointToLayer: pointToCircleMarkerLayer,
                onEachFeature,
                name: 'wko_gwio',
              } as NamedGeoJSONOptions);
              wko_gwoLayer = L.geoJSON(wko_gwo, {
                pointToLayer: pointToCircleMarkerLayer,
                onEachFeature,
                name: 'wko_gwo',
              } as NamedGeoJSONOptions);
              wko_gbesLayer = L.geoJSON(wko_gbes, {
                pointToLayer: pointToCircleMarkerLayer,
                onEachFeature,
                name: 'wko_gbes',
              } as NamedGeoJSONOptions);
              wko_obesLayer = L.geoJSON(wko_obes, {
                pointToLayer: pointToCircleMarkerLayer,
                onEachFeature,
                name: 'wko_obes',
              } as NamedGeoJSONOptions);
              // wko_installatiesLayer : dyamic layer, declared in app-state (as part of state)
              wko_diepteLayer = L.geoJSON(wko_diepte, {
                pointToLayer,
                onEachFeature,
                style: (f) => {
                  return {
                    color: 'blue',
                    fillColor: 'blue',
                  };
                },
                name: 'wko_diepte',
              } as NamedGeoJSONOptions);
              // wko_natuurLayer : dyamic layer, declared in app-state (as part of state)
              wko_ordeningLayer = L.geoJSON(wko_ordening, {
                pointToLayer,
                onEachFeature,
                style: (f) => {
                  return {
                    color: 'purple',
                    fillColor: 'purple',
                  };
                },
                name: 'wko_ordening',
              } as NamedGeoJSONOptions);
              // wko_specprovbeleidLayer : dyamic layer, declared in app-state (as part of state)
              wko_verbodLayer = L.geoJSON(wko_verbod, {
                pointToLayer,
                onEachFeature,
                style: (f) => {
                  return {
                    color: 'yellow',
                    fillColor: 'yellow',
                  };
                },
                name: 'wko_verbod',
              } as NamedGeoJSONOptions);
              verzorgingshuizenLayer = L.geoJSON(verzorgingshuizen, {
                pointToLayer,
                onEachFeature,
                name: 'verzorgingshuizen',
              } as NamedGeoJSONOptions);
              ziekenhuizen_rkLayer = L.geoJSON(ziekenhuizen_rk, {
                pointToLayer,
                onEachFeature,
                name: 'ziekenhuizen_rk',
              } as NamedGeoJSONOptions);

              ziekenhuizen_v3Layer = L.geoJSON(ziekenhuizen_v3, {
                pointToLayer: pointToZHv3Layer,
                onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                  layer.on('click', () => {
                    actions.selectHospital(feature as Feature<Point>);
                  });
                },
                name: 'ziekenhuizen_v3',
              } as NamedGeoJSONOptions);

              const baseTree = {
                label: 'Achtergrondkaart',
                children: [
                  { label: 'grijs', layer: pdokachtergrondkaartGrijs },
                  { label: 'normaal', layer: pdokachtergrondkaart },
                ],
              } as ILayerTree;
              const overlayTree = {
                label: 'Overlay kaartlagen',
                children: [
                  {
                    label: 'Instellingen',
                    children: [
                      { label: 'Ziekenhuizen v3', layer: ziekenhuizen_v3Layer },
                      { label: 'vvt', layer: vvtLayer },
                      { label: 'ggz', layer: ggzLayer },
                      { label: 'ghz', layer: ghzLayer },
                      { label: 'verzorgingshuizen', layer: verzorgingshuizenLayer },
                      { label: 'Ziekenhuizen routekaarten', layer: ziekenhuizen_rkLayer },
                    ],
                  },
                  { label: 'Oppervlaktewater', 
                    children: [
                      { label: 'Wateren potentie', layer: wateren_potentie_gt1haLayer },
                    ]
                  },
                  {
                    label: 'Divers',
                    children: [
                      { label: 'rioolwaterzuiveringen', layer: rwzisLayer },
                      { label: 'effluentleidingen', layer: effluentLayer },
                      { label: 'rioolleidingen', layer: rioolleidingenLayer },
                      { label: 'gasloze wijken en buurten', layer: gl_wk_buLayer },
                    ],
                  },
                  {
                    label: 'WKO: installaties',
                    selectAllCheckbox: true,
                    children: [
                      { label: 'WKO GWI', layer: wko_gwiLayer },
                      { label: 'WKO GWIO', layer: wko_gwioLayer },
                      { label: 'WKO grondwateronttrekkingen', layer: wko_gwoLayer },
                      { label: 'WKO gesloten bodemenergiesysteem', layer: wko_gbesLayer },
                      { label: 'WKO open bodemenergiesystemen', layer: wko_obesLayer },
                      { label: 'WKO Installaties', layer: wko_installatiesLayer },
                    ],
                  },
                  {
                    label: 'WKO: restricties',
                    selectAllCheckbox: true,
                    children: [
                      { label: '&nbsp; &#x1F7E6; &nbsp;WKO Diepte', layer: wko_diepteLayer },
                      { label: '&nbsp; &#x1F7E9; &nbsp;WKO Natuur</span>', layer: wko_natuurLayer },
                      { label: '&nbsp; &#x1F7EA; &nbsp;WKO Ordening</span>', layer: wko_ordeningLayer },
                      { label: '&nbsp; &#x1F7E7; &nbsp;WKO SpecProvBeleid</span>', layer: wko_specprovbeleidLayer },
                      { label: '&nbsp; &#x1F7E8; &nbsp;WKO Verbodsgebieden</span>', layer: wko_verbodLayer },
                    ],
                  },
                ],
              } as ILayerTree;
              L.control.layers.tree(baseTree, overlayTree).addTo(map);
            },
          })
        ),
        m(
          '.panel',
          {
            style: 'position: absolute; top: 0; left: 70vw; padding: 5px;',
          },
          [
            m('h3', `Zorgvastgoed en aquathermie`),
            selectedHospital && selectedHospital.properties && m('h4', selectedHospital.properties.Name),
            m(InfoPanel, { state, actions }),
            // m('ul', waterProps && Object.keys(waterProps).map((key) => m('li', `${key}: ${waterProps[key]}`))),
          ]
        ),
        m(Legend, { state, actions }),
      ];
    },
  };
};
