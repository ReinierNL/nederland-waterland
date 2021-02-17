import m from 'mithril';
import L, { GeoJSONOptions, ILayerTree, InteractiveLayerOptions, LayersControlEvent } from 'leaflet';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';
import 'leaflet.control.layers.tree';
import 'leaflet/dist/leaflet.css';
// import 'leaflet-hash';
import {
  ziekenhuisIconX,
  ziekenhuisIconV,
  verzorgingstehuisIcon,
  sewageIcon,
  wko_installatieIcon,
  wko_gwoIcon,
} from '../utils';
import { IZiekenhuis } from '../models/ziekenhuis';
import { MeiosisComponent } from '../services/meiosis';
import { InfoPanel } from './info-panel';
import { Feature, Point } from 'geojson';

export interface NamedGeoJSONOptions<P = any> extends GeoJSONOptions<P> {
  name: string;
}

export const HomePage: MeiosisComponent = () => {
  let map: L.Map;
  let ziekenhuisLayer: L.GeoJSON;
  let ziekenhuis2019Layer: L.GeoJSON;
  let verzorgingshuizenLayer: L.GeoJSON;
  let ziekenhuis_rkLayer: L.GeoJSON;
  let vvtLayer: L.GeoJSON;
  let ggzLayer: L.GeoJSON;
  let ghzLayer: L.GeoJSON;
  let rwzisLayer: L.GeoJSON;
  let effluentLayer: L.GeoJSON;
  let rioolleidingenLayer: L.GeoJSON;
  let gl_wk_buLayer: L.GeoJSON;
  let wko_gwiLayer: L.GeoJSON;
  let wko_gwioLayer: L.GeoJSON;
  let wko_gwoLayer: L.GeoJSON;
  let wko_gbesLayer: L.GeoJSON;
  let wko_obesLayer: L.GeoJSON;
  let wko_diepteLayer: L.GeoJSON;
  let wko_natuurLayer: L.GeoJSON;
  let wko_ordeningLayer: L.GeoJSON;
  let wko_specprovbeleidLayer: L.GeoJSON;
  let wko_verbodLayer: L.GeoJSON;
  let waterLayer: L.GeoJSON;
  // let selectedHospitalLayer: L.Marker;

  return {
    view: ({ attrs: { state, actions } }) => {
      console.log(state);
      const {
        hospitals,
        ziekenhuizen2019,
        selectedItem,
        selectedHospital,
        selectedWaterItem,
        water,
        verzorgingshuizen,
        ziekenhuizen_rk,
        wateren_potentie_gt1haLayer,
        ggz,
        ghz,
        vvt,
        rwzis,
        effluent,
        // rioolleidingen,
        gl_wk_bu,
        wko_gwi,
        wko_gwio,
        wko_gwo,
        wko_gbes,
        wko_obes,
        wko_diepte,
        wko_natuur,
        wko_ordening,
        wko_specprovbeleid,
        wko_verbod,
      } = state.app;

      if (water) {
        waterLayer.clearLayers();
        waterLayer.addData(water);
      }
      const { updateActiveLayers } = actions;

      const props = selectedItem && selectedItem.properties;
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

              const pointToWkoInstallatieLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
                return new L.Marker(latlng, {
                  icon: wko_installatieIcon,
                  title: feature.properties.Name,
                });
              };

              const pointToWkoGwoLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
                return new L.Marker(latlng, {
                  icon: wko_gwoIcon,
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
              rioolleidingenLayer = L.geoJSON(effluent, {
                pointToLayer,
                onEachFeature,
                name: 'effluent',
              } as NamedGeoJSONOptions);
              gl_wk_buLayer = L.geoJSON(gl_wk_bu, {
                pointToLayer,
                onEachFeature,
                name: 'gl_wk_bu',
              } as NamedGeoJSONOptions);
              wko_gwiLayer = L.geoJSON(wko_gwi, {
                pointToLayer: pointToWkoInstallatieLayer,
                onEachFeature,
                name: 'wko_gwi',
              } as NamedGeoJSONOptions);
              wko_gwioLayer = L.geoJSON(wko_gwio, {
                pointToLayer: pointToWkoGwoLayer,
                onEachFeature,
                name: 'wko_gwio',
              } as NamedGeoJSONOptions);
              wko_gwoLayer = L.geoJSON(wko_gwo, {
                pointToLayer: pointToSewageLayer,
                onEachFeature,
                name: 'wko_gwo',
              } as NamedGeoJSONOptions);
              wko_gbesLayer = L.geoJSON(wko_gbes, {
                pointToLayer: pointToSewageLayer,
                onEachFeature,
                name: 'wko_gbes',
              } as NamedGeoJSONOptions);
              wko_obesLayer = L.geoJSON(wko_obes, {
                pointToLayer: pointToSewageLayer,
                onEachFeature,
                name: 'wko_obes',
              } as NamedGeoJSONOptions);
              wko_diepteLayer = L.geoJSON(wko_diepte, {
                pointToLayer,
                onEachFeature,
                name: 'wko_diepte',
              } as NamedGeoJSONOptions);
              wko_natuurLayer = L.geoJSON(wko_natuur, {
                pointToLayer,
                onEachFeature,
                name: 'wko_natuur',
              } as NamedGeoJSONOptions);
              wko_ordeningLayer = L.geoJSON(wko_ordening, {
                pointToLayer,
                onEachFeature,
                style: (f) => {
                  const fillColor = f?.properties.fid % 2 === 0 ? 'red' : 'green';
                  return {
                    fillColor,
                  };
                },
                name: 'wko_ordening',
              } as NamedGeoJSONOptions);
              wko_specprovbeleidLayer = L.geoJSON(wko_specprovbeleid, {
                pointToLayer,
                onEachFeature,
                name: 'wko_specprovbeleid',
              } as NamedGeoJSONOptions);
              wko_verbodLayer = L.geoJSON(wko_verbod, {
                pointToLayer,
                onEachFeature,
                name: 'wko_verbod',
              } as NamedGeoJSONOptions);
              verzorgingshuizenLayer = L.geoJSON(verzorgingshuizen, {
                pointToLayer,
                onEachFeature,
                name: 'verzorgingshuizen',
              } as NamedGeoJSONOptions);
              ziekenhuis_rkLayer = L.geoJSON(ziekenhuizen_rk, {
                pointToLayer,
                onEachFeature,
                name: 'ziekenhuizen_rk',
              } as NamedGeoJSONOptions);

              ziekenhuis2019Layer = L.geoJSON<IZiekenhuis>(ziekenhuizen2019, {
                pointToLayer: (feature, latlng) => {
                  const { locatie, organisatie, active } = feature.properties;
                  const title = `${locatie} (${organisatie})`;
                  return new L.Marker(
                    latlng,
                    active === false
                      ? {
                          icon: ziekenhuisIconX,
                          title,
                        }
                      : {
                          icon: ziekenhuisIconV,
                          title,
                        }
                  );
                },
                onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                  layer.on('click', () => {
                    actions.selectHospital(feature as Feature<Point>);
                  });
                },
              }).addTo(map);

              ziekenhuisLayer = L.geoJSON<IZiekenhuis>(hospitals, {
                pointToLayer: (feature, latlng) => {
                  const { locatie, organisatie, active } = feature.properties;
                  const title = `${locatie} (${organisatie})`;
                  return new L.Marker(
                    latlng,
                    active === false
                      ? {
                          icon: ziekenhuisIconX,
                          title,
                        }
                      : {
                          icon: ziekenhuisIconV,
                          title,
                        }
                  );
                },
                onEachFeature,
              });
              // }).addTo(map);

              waterLayer = L.geoJSON(undefined, {
                pointToLayer: (f, latlng) =>
                  L.circleMarker(latlng, {
                    // color: 'black',
                    stroke: false,
                    fillColor: f.properties.cat === 0 ? 'green' : f.properties.cat === 1 ? 'orange' : 'red',
                    fillOpacity: 1,
                    radius: Math.min(10, f.properties.births / 10),
                  }),
                onEachFeature: (feature, layer) => {
                  layer.bindPopup(JSON.stringify(feature.properties, null, 2));
                  layer.on('click', () => {
                    actions.selectWaterFeature(feature);
                  });
                },
              }).addTo(map);

              const baseTree = {
                label: 'Achtergrondkaart',
                children: [
                  { label: 'grijs', layer: pdokachtergrondkaartGrijs },
                  { label: 'normaal', layer: pdokachtergrondkaart },
                ],
              } as ILayerTree;
              const overlayTree = {
                label: 'Kaartlagen',
                children: [
                  // { label: 'Water', layer: waterLayer },
                  { label: 'Wateren potentie', layer: wateren_potentie_gt1haLayer },
                  {
                    label: 'Instellingen',
                    children: [
                      { label: 'Ziekenhuizen', layer: ziekenhuisLayer },
                      { label: 'Ziekenhuizen 2019', layer: ziekenhuis2019Layer },
                      { label: 'vvt', layer: vvtLayer },
                      { label: 'ggz', layer: ggzLayer },
                      { label: 'ghz', layer: ghzLayer },
                      { label: 'verzorgingshuizen', layer: verzorgingshuizenLayer },
                      { label: 'Ziekenhuizen routekaarten', layer: ziekenhuis_rkLayer },
                    ],
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
                    ],
                  },
                  {
                    label: 'WKO: restricties',
                    selectAllCheckbox: true,
                    children: [
                      { label: 'WKO Diepte', layer: wko_diepteLayer },
                      { label: 'WKO Natuur', layer: wko_natuurLayer },
                      { label: 'WKO Ordening', layer: wko_ordeningLayer },
                      { label: 'WKO SpecProvBeleid', layer: wko_specprovbeleidLayer },
                      { label: 'WKO Verbodsgebieden', layer: wko_verbodLayer },
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
            m(InfoPanel, { state, actions }),
            selectedHospital && selectedHospital.properties && m('h2', selectedHospital.properties.Name),
            props &&
              m('table', [
                m('tr', [m('th', 'Kenmerk'), m('th', 'Waarde')]),
                ...Object.keys(props).map((key) => m('tr', [m('td', key), m('td', props[key])])),
              ]),
            m('ul', waterProps && Object.keys(waterProps).map((key) => m('li', `${key}: ${waterProps[key]}`))),
          ]
        ),
      ];
    },
  };
};
