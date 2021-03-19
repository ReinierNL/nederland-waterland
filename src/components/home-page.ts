import m from 'mithril';
import L, { GeoJSONOptions, ILayerTree, LeafletEvent } from 'leaflet';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';
import 'leaflet.control.layers.tree';
import 'leaflet/dist/leaflet.css';
// import 'leaflet-hash';
import { verzorgingstehuisIcon, sewageIcon, ziekenhuisIcon, ziekenhuisIconGreen, ziekenhuisIconOrange } from '../utils';
import { MeiosisComponent } from '../services/meiosis';
import { InfoPanel } from './info-panel';
import { HospitalInfoPanel } from './hospital-info-panel';
import { Feature, Point } from 'geojson';
import { Legend } from './legend';
import { Legend_rk } from './legend_rk';
import logoDeltares from '../assets/Deltares.png';
import logoSyntraal from '../assets/Syntraal.png';
import logoTNO from '../assets/TNO.png';

export interface NamedGeoJSONOptions<P = any> extends GeoJSONOptions<P> {
  name: string;
}

export const HomePage: MeiosisComponent = () => {
  let map: L.Map;
  let ziekenhuizen_rkLayer: L.GeoJSON;
  let ziekenhuizenLayer: L.GeoJSON;
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
  // let wko_gwoLayer: L.GeoJSON;  // dynamic
  // let wko_gbesLayer: L.GeoJSON; // dynamic
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
        selectedLayer,
        wateren_potentie_gt1haLayer,
        ziekenhuizen,
        // verzorgingshuizen,
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
        wko_gwoLayer,
        wko_gbesLayer,
        wko_obes,
        wko_installatiesLayer,
        wko_diepte,
        wko_natuurLayer,
        wko_ordening,
        wko_specprovbeleidLayer,
        wko_verbod,
        selectedMarkersLayer,
      } = state.app;

      const { updateActiveLayers, setZoomLevel } = actions;

      // const waterProps = selectedWaterItem && selectedWaterItem.properties;
      // console.table(waterProps);
      return [
        m('.content', [
          m(
            '.container',
            { style: 'position: fixed;' },
            m('#map', {
              style:
                'height: 95vh; width: 70vw; margin: 0; padding: 0; overflow: hidden; box-shadow: (0px 0px 20px rgba(0,0,0,.3))',
              oncreate: () => {
                map = L.map('map', {}).setView([52.14, 5.109], 8);
                map.on('overlayadd', (e: any) => updateActiveLayers(e.layer.options.name, true));
                map.on('overlayremove', (e: any) => updateActiveLayers(e.layer.options.name, false));
                map.on('zoomend', () => setZoomLevel(map.getZoom()));
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

                const pointToPurpleCircleMarkerLayer = (
                  _feature: Feature<Point, any>,
                  latlng: L.LatLng
                ): L.CircleMarker<any> => {
                  return new L.CircleMarker(latlng, {
                    radius: 5,
                    stroke: false,
                    fillColor: 'purple',
                    fillOpacity: 0.8,
                  });
                };

                const pointToCircleMarkerLayer = (
                  _feature: Feature<Point, any>,
                  latlng: L.LatLng
                ): L.CircleMarker<any> => {
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

                const pointToZHrkLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
                  // for the ziekenhuizen_routekaarten layer: return green or orange icon
                  var rkIcon = ziekenhuisIconGreen;
                  if (feature.properties && feature.properties['Concept ingeleverd']) {
                    rkIcon = ziekenhuisIconOrange;
                  }
                  return new L.Marker(latlng, {
                    icon: rkIcon,
                    title: feature.properties.Name,
                  });
                };

                // const onEachFeature = (feature: Feature<Point, any>, layer: L.Layer) => {
                //   layer.on('click', (e) => {
                //     actions.selectFeature(feature as Feature<Point>, e.target?.options?.name);
                //   });
                // };

                vvtLayer = L.geoJSON(vvt, {
                  pointToLayer,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', (e: LeafletEvent) => {
                      actions.selectFeature(feature as Feature<Point>, 'vvt');
                    });
                  },
                  name: 'vvt',
                } as NamedGeoJSONOptions);
                ghzLayer = L.geoJSON(ghz, {
                  pointToLayer,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', (e: LeafletEvent) => {
                      actions.selectFeature(feature as Feature<Point>, 'ghz');
                    });
                  },
                  name: 'ghz',
                } as NamedGeoJSONOptions);
                ggzLayer = L.geoJSON(ggz, {
                  pointToLayer,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', (e: LeafletEvent) => {
                      actions.selectFeature(feature as Feature<Point>, 'ggz');
                    });
                  },
                  name: 'ggz',
                } as NamedGeoJSONOptions);

                effluentLayer = L.geoJSON(effluent, {
                  pointToLayer,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'effluent', layer);
                    });
                  },
                  style: () => {
                    return {
                      color: 'blue',
                    };
                  },
                  name: 'effluent',
                } as NamedGeoJSONOptions);

                gl_wk_buLayer = L.geoJSON(gl_wk_bu, {
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'gl_wk_bu', layer);
                    });
                  },
                  name: 'gl_wk_bu',
                } as NamedGeoJSONOptions);

                // rioolleidingenLayer : dyamic layer, declared in app-state (as part of state)

                rwzisLayer = L.geoJSON(rwzis, {
                  pointToLayer: pointToSewageLayer,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', (e: LeafletEvent) => {
                      actions.selectFeature(feature as Feature<Point>, 'rwzis');
                    });
                  },
                  name: 'rwzis',
                } as NamedGeoJSONOptions);

                wko_diepteLayer = L.geoJSON(wko_diepte, {
                  pointToLayer,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e: LeafletEvent) => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_diepte', layer);
                    });
                  },
                  style: () => {
                    return {
                      color: 'cornflowerblue',
                      fillColor: 'blue',
                    };
                  },
                  name: 'wko_diepte',
                } as NamedGeoJSONOptions);

                wko_gwiLayer = L.geoJSON(wko_gwi, {
                  pointToLayer: pointToCircleMarkerLayer,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_gwi', layer);
                    });
                  },
                  name: 'wko_gwi',
                } as NamedGeoJSONOptions);

                wko_gwioLayer = L.geoJSON(wko_gwio, {
                  pointToLayer: pointToCircleMarkerLayer,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_gwio', layer);
                    });
                  },
                  name: 'wko_gwio',
                } as NamedGeoJSONOptions);
                // wko_gwoLayer : dyamic layer, declared in app-state (as part of state)
                // wko_gbesLayer : dyamic layer, declared in app-state (as part of state)
                // wko_installatiesLayer : dyamic layer, declared in app-state (as part of state)

                wko_obesLayer = L.geoJSON(wko_obes, {
                  pointToLayer: pointToPurpleCircleMarkerLayer,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_obes', layer);
                    });
                  },
                  name: 'wko_obes',
                } as NamedGeoJSONOptions);

                // wko_natuurLayer : dyamic layer, declared in app-state (as part of state)
                wko_ordeningLayer = L.geoJSON(wko_ordening, {
                  pointToLayer,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_ordening', layer);
                    });
                  },
                  style: () => {
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
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_verbod', layer);
                    });
                  },
                  style: () => {
                    return {
                      color: 'yellow',
                      fillColor: 'yellow',
                    };
                  },
                  name: 'wko_verbod',
                } as NamedGeoJSONOptions);

                ziekenhuizenLayer = L.geoJSON(ziekenhuizen, {
                  pointToLayer: pointToZHv3Layer,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectHospital(feature as Feature<Point>);
                    });
                  },
                  name: 'ziekenhuizen',
                } as NamedGeoJSONOptions).addTo(map);

                ziekenhuizen_rkLayer = L.geoJSON(ziekenhuizen_rk, {
                  pointToLayer: pointToZHrkLayer,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', (e) => {
                      actions.selectFeature(feature as Feature<Point>, 'ziekenhuizen_rk', layer);
                    });
                  },
                  name: 'ziekenhuizen_rk',
                } as NamedGeoJSONOptions);

                selectedMarkersLayer?.addTo(map);

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
                        { label: 'Ziekenhuizen', layer: ziekenhuizenLayer },
                        { label: 'Verpleging, verzorging en thuiszorg', layer: vvtLayer },
                        { label: 'Geesteljke gezondheidszorg', layer: ggzLayer },
                        { label: 'Gehandicaptenzorg', layer: ghzLayer },
                        { label: 'Ziekenhuizen routekaarten', layer: ziekenhuizen_rkLayer },
                      ],
                    },
                    {
                      label: 'Oppervlaktewater (TEO)',
                      children: [{ label: 'TEO potentie *', layer: wateren_potentie_gt1haLayer }],
                    },
                    {
                      label: 'Afvalwater (TEA)',
                      children: [
                        { label: 'rioolwaterzuiveringen', layer: rwzisLayer },
                        {
                          label: '<span style="color:blue"><b>&nbsp;&#x23AF;&nbsp;</b>effluentleidingen</span>',
                          layer: effluentLayer,
                        },
                        {
                          label: '<span style="color:#8080FF"><b>&nbsp;&#x23AF;&nbsp;</b>rioolleidingen</span> *',
                          layer: rioolleidingenLayer,
                        },
                      ],
                    },
                    {
                      label: 'Divers',
                      children: [{ label: 'aardgasvrije wijken en buurten', layer: gl_wk_buLayer }],
                    },
                    {
                      label: 'WKO: installaties',
                      selectAllCheckbox: true,
                      children: [
                        { label: 'WKO grondwaterinfiltratie', layer: wko_gwiLayer },
                        { label: 'WKO grondwaterinfiltratie en -onttrekking', layer: wko_gwioLayer },
                        { label: 'WKO grondwateronttrekking *', layer: wko_gwoLayer },
                        { label: 'WKO gesloten bodemenergiesysteem *', layer: wko_gbesLayer },
                        { label: 'WKO open bodemenergiesystemen', layer: wko_obesLayer },
                        { label: 'WKO Installaties *', layer: wko_installatiesLayer },
                      ],
                    },
                    {
                      label: 'WKO: restricties',
                      selectAllCheckbox: true,
                      children: [
                        { label: '&nbsp; &#x1F7E6; &nbsp;WKO Diepte', layer: wko_diepteLayer },
                        { label: '&nbsp; &#x1F7E9; &nbsp;WKO Natuur *', layer: wko_natuurLayer },
                        { label: '&nbsp; &#x1F7EA; &nbsp;WKO Ordening', layer: wko_ordeningLayer },
                        { label: '&nbsp; &#x1F7E7; &nbsp;WKO SpecProvBeleid *', layer: wko_specprovbeleidLayer },
                        { label: '&nbsp; &#x1F7E8; &nbsp;WKO Verbodsgebieden', layer: wko_verbodLayer },
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
              m('h3', 'Aquathermie & Zorgvastgoed Dashboard'),
              selectedHospital &&
                selectedHospital.properties && [
                  m('p', 'Geselecteerd ziekenhuis:'),
                  m('h4', selectedHospital.properties.Name),
                  [
                    m('span', 'Organisatie: '),
                    m('b', selectedHospital.properties.Organisatie),
                    m('table.hospital-feature-props', [
                      ...Object.keys(selectedHospital.properties)
                        .filter(
                          (key) =>
                            !selectedHospital.properties ||
                            (selectedHospital.properties.hasOwnProperty(key) && key != 'active')
                        )
                        .map((key) =>
                          m('tr', [
                            m('td.bold.toright', key),
                            m('td', !selectedHospital.properties ? '' : selectedHospital.properties[key]),
                          ])
                        ),
                    ]),
                  ],
                ],
              // m(HospitalInfoPanel, { state, actions }),    // funny: this leads to not clearing => duplication of the above parts
              selectedItem && m(InfoPanel, { state, actions }),

              selectedLayer &&
                selectedLayer == 'ziekenhuizen_rk' && [
                  m('.header-routekaart', 'Portefeuilleroutekaart Ziekenhuizen'),
                  m('.text-routekaart', 'Routekaarten ingeleverd: 15.7 % op basis van aantal organisaties'),
                  m('.header-routekaart', 'Doelstelling klimaatakkoord'),
                  m('.text-routekaart', 'Totale CO₂-emissie (peiljaar 2016): 100 %'),
                  m(
                    '.text-routekaart',
                    'Gerealiseerde CO₂-besparing 2030 (gebaseerd op ingeleverde routekaarten): 3.6 %'
                  ),
                  m('.text-routekaart', 'Ambitie CO₂-besparing 2030 (gebaseerd op klimaatdoelstelling): 49 %'),
                ],
            ]
          ),
          (!selectedLayer || selectedLayer != 'ziekenhuizen_rk') && m(Legend, { state, actions }),
          selectedLayer && selectedLayer == 'ziekenhuizen_rk' && m(Legend_rk, { state, actions }),
        ]),
        m(
          '.disclaimer',
          'Data over WKO bronnen is afkomstig van de WKO-bodemenergietool (wkotool.nl). ' +
            'Mogelijk worden niet alle WKO systemen getoond op de kaart omdat het bevoegd gezag niet alle systemen in het LGR registreert'
        ),
        m('.footer', [
          m('.logo', m('img', { src: logoTNO, alt: 'logo TNO', width: '82px' })),
          m('.logo', m('img', { src: logoDeltares, alt: 'logo Deltares', width: '114px' })),
          m('.logo', m('img', { src: logoSyntraal, alt: 'logo Syntraal', width: '140px' })),
        ]),
      ];
    },
  };
};
