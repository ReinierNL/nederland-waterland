import m from 'mithril';
import L, { GeoJSONOptions } from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.control.layers.tree/L.Control.Layers.Tree.css';
import 'leaflet.control.layers.tree';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import '../css/markercluster.overrule.css';   // overrules the default colors of MarkerCluster
import { MeiosisComponent } from '../services/meiosis';
import { InfoPanel } from './info-panel';
import { Feature, Point } from 'geojson';
import { Legend_care } from './legend_care';
import { Legend_discr } from './legend_discr';
// import { Legend_str } from './legend_str';
import { Legend_teo } from './legend_teo';
import { Legend_zh } from './legend_zh';
import logoDeltares from 'url:../assets/Deltares.png';
import logoSyntraal from 'url:../assets/Syntraal.png';
import logoTNO from 'url:../assets/TNO.png';
import logoEVZ from 'url:../assets/evz.png';
import { isCareLayer, isCareOrCureLayer, isCureLayer, isDeltaresLayer, isEnergyRelatedLayer, 
  isSportLayer, isSyntraalLayer, isTEOLayer, isTVWLayer, isVattenfallLayer, isWKOLayer } from './utils_rs';
import layerTitles from '../assets/layerTitles.json';
import layerPercentages from '../assets/layer_percentages.json';
import { pointToLayerCare, pointToLayerGreenCircleMarker, pointToLayerPurpleCircleMarker, 
  pointToLayerSewage, pointToLayerSkating, pointToLayerSwimming, pointToLayerZHrk } from './markers'
import { ChartJs } from './chart-js';
import { Chart } from 'chart.js';

import { provincies, sum_of_bvo_2020, sum_of_bvo_2030 } from '../data/data_evz.json';

export interface NamedGeoJSONOptions<P = any> extends GeoJSONOptions<P> {
  name: string;
}

export const HomePage: MeiosisComponent = () => {
  let map: L.Map;
  let categorale_instellingenLayer_rk: L.GeoJSON;
  let polikliniekenLayer_rk: L.GeoJSON;
  let ziekenhuizenLayer_rk: L.GeoJSON;
  let vvtLayer_rk: L.GeoJSON;
  let ggzLayer_rk: L.GeoJSON;
  let ghzLayer_rk: L.GeoJSON;
  //let wateren_potentie_gt1haLayer: L.GeoJSON; // dynamic
  let rwzisLayer: L.GeoJSON;
  let effluentLayer: L.GeoJSON;
  //let rioolleidingenLayer: L.GeoJSON; // dynamic
  let gl_wk_buLayer: L.GeoJSON;
  let skatingsLayer: L.GeoJSON;
  let swimmingsLayer: L.GeoJSON;
  // let tvwLayer: L.GeoJSON;  // dynamic
  let warmtenetten_nbr_lokaalLayer: L.GeoJSON;
  let warmtenetten_nbr_infraLayer: L.GeoJSON;
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
  //let wn_vf_xxxLayer: L.GeoJSON; // dynamic (9 layers)
  
  return {
    view: ({ attrs: { state, actions } }) => {
      // console.log(state);
      const {
        selectedItem,
        selectedHospital,
        selectedLayer,
        selectedMarkersLayer,
        // layers and layer data objects (json):
        categorale_instellingen,
        effluent,
        ggz,
        ghz,
        gl_wk_bu,
        poliklinieken,
        rwzis,
        rioolleidingenLayer,
        skatings,
        swimmings,
        tvwLayer,
        vvt,
        warmtenetten_nbr_lokaal,
        warmtenetten_nbr_infra,
        wateren_potentie_gt1haLayer,
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
        wn_vf_almereLayer,
        wn_vf_amsterdamLayer,
        wn_vf_arnhemLayer,
        wn_vf_edeLayer,
        wn_vf_leidenLayer,
        wn_vf_lelystadLayer,
        wn_vf_nijmegenLayer,
        wn_vf_rotterdamLayer,
        wn_vf_vlielandLayer,
        ziekenhuizen,
      } = state.app;

      const { mapClick, setZoomLevel, toggleRoutekaartActivity, updateActiveLayers } = actions;

      return [
        m('.content', [
          m('.container',
            { style: 'position: fixed;' },
            m('#map', {
              style:
                'height: 97vh; width: 70vw; margin: 0; padding: 0; overflow: hidden; box-shadow: (0px 0px 20px rgba(0,0,0,.3))',
              oncreate: () => {
                map = L.map('map', {}).setView([52.0, 5.2], 8);
                map.on('overlayadd', (e: any) => updateActiveLayers(e.layer.options.name, true));
                map.on('overlayremove', (e: any) => updateActiveLayers(e.layer.options.name, false));
                map.on('zoomend', () => setZoomLevel(map.getZoom()));
                map.on('click', () => mapClick())
                L.control.scale({ imperial: false, metric: true }).addTo(map);

                // nieuwe BRT achtergondkaart (eind 2021)
                const pdok_brt_standaard = new L.TileLayer(
                  'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?layer=standaard&style=default&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:28992:{z}&TileCol={x}&TileRow={y}',
                  {
                    minZoom: 3,
                    maxZoom: 18,
                    attribution: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
                  }
                );
                const pdok_brt_grijs = new L.TileLayer(
                  'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?layer=grijs&style=default&tilematrixset=EPSG:3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix=EPSG:28992:{z}&TileCol={x}&TileRow={y}',
                  {
                    minZoom: 3,
                    maxZoom: 18,
                    attribution: 'Map data: <a href="http://www.kadaster.nl">Kadaster</a>',
                  }
                );
                pdok_brt_standaard.addTo(map);
                // Hash in URL
                // new (L as any).Hash(map);


                const filter_main_branch = (f?: Feature): boolean => {
                  // can we determine selected item from app state?
                  // (no: this function one is only executed once)
                  // console.log('filter_main_branch called');
                  // const { selectedItem } = state.app;
                  // console.log('filter_main_branch: selected item: ' + selectedItem);
                  // 2021-10-20: disabled this filter: this eliminates too many locations
                  //const value = f && f.properties ? f.properties['IsMainBranch'] : undefined;
                  //return value == true
                  return true
                };
                
                // layers:

                categorale_instellingenLayer_rk = L.geoJSON(categorale_instellingen, {
                  pointToLayer: pointToLayerZHrk,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectHospital(feature as Feature<Point>, 'categorale_instellingen');
                    });
                  },
                  name: 'categorale_instellingen',
                } as NamedGeoJSONOptions);

                effluentLayer = L.geoJSON(effluent, {
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
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

                ggzLayer_rk = (L as any).markerClusterGroup({ name: 'ggz' });
                L.geoJSON(ggz, {
                  filter: filter_main_branch,
                  pointToLayer: pointToLayerCare,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'ggz');
                    });
                  },
                  name: 'ggz',
                } as NamedGeoJSONOptions).eachLayer((l) => ggzLayer_rk.addLayer(l));

                ghzLayer_rk = (L as any).markerClusterGroup({ name: 'ghz' });
                L.geoJSON(ghz, {
                  filter: filter_main_branch,
                  pointToLayer: pointToLayerCare,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'ghz');
                    });
                  },
                  name: 'ghz',
                } as NamedGeoJSONOptions).eachLayer((l) => ghzLayer_rk.addLayer(l));

                gl_wk_buLayer = L.geoJSON(gl_wk_bu, {
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'gl_wk_bu', layer);
                    });
                  },
                  name: 'gl_wk_bu',
                } as NamedGeoJSONOptions);

                polikliniekenLayer_rk = L.geoJSON(poliklinieken, {
                  pointToLayer: pointToLayerZHrk,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectHospital(feature as Feature<Point>, 'poliklinieken');
                    });
                  },
                  name: 'poliklinieken',
                } as NamedGeoJSONOptions);

                // rioolleidingenLayer : dyamic layer, declared in app-state (as part of state)

                rwzisLayer = L.geoJSON(rwzis, {
                  pointToLayer: pointToLayerSewage,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'rwzis');
                    });
                  },
                  name: 'rwzis',
                } as NamedGeoJSONOptions);

                skatingsLayer = L.geoJSON(skatings, {
                  pointToLayer: pointToLayerSkating,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'skating');
                    });
                  },
                  name: 'skating',
                } as NamedGeoJSONOptions);

                swimmingsLayer = L.geoJSON(swimmings, {
                  pointToLayer: pointToLayerSwimming,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'swimming');
                    });
                  },
                  name: 'swimming',
                } as NamedGeoJSONOptions);

                vvtLayer_rk = (L as any).markerClusterGroup({ name: 'vvt' });
                L.geoJSON(vvt, {
                  filter: filter_main_branch,
                  pointToLayer: pointToLayerCare,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'vvt');
                    });
                  },
                  name: 'vvt',
                } as NamedGeoJSONOptions).eachLayer((l) => vvtLayer_rk.addLayer(l));

                warmtenetten_nbr_lokaalLayer = L.geoJSON(warmtenetten_nbr_lokaal, {
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'warmtenetten_nbr_lokaal', layer);
                    });
                  },
                  name: 'warmtenetten_nbr_lokaal',
                } as NamedGeoJSONOptions);

                warmtenetten_nbr_infraLayer = L.geoJSON(warmtenetten_nbr_infra, {
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'warmtenetten_nbr_infra', layer);
                    });
                  },
                  name: 'warmtenetten_nbr_infra',
                } as NamedGeoJSONOptions);

                wko_diepteLayer = L.geoJSON(wko_diepte, {
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', () => {
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
                  pointToLayer: pointToLayerGreenCircleMarker,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', () => {
                        actions.selectFeature(feature as Feature<Point>, 'wko_gwi', layer);
                      });
                  },
                  name: 'wko_gwi',
                } as NamedGeoJSONOptions);

                wko_gwioLayer = L.geoJSON(wko_gwio, {
                  pointToLayer: pointToLayerGreenCircleMarker,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_gwio', layer);
                    });
                  },
                  name: 'wko_gwio',
                } as NamedGeoJSONOptions);

                // wko_gwoLayer : dyamic layer, declared in app-state (as part of state)
                // wko_gbesLayer : dyamic layer, declared in app-state (as part of state)
                // wko_installatiesLayer : dyamic layer, declared in app-state (as part of state)

                wko_obesLayer = L.geoJSON(wko_obes, {
                  pointToLayer: pointToLayerPurpleCircleMarker,
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectFeature(feature as Feature<Point>, 'wko_obes', layer);
                    });
                  },
                  name: 'wko_obes',
                } as NamedGeoJSONOptions);

                // wko_natuurLayer : dyamic layer, declared in app-state (as part of state)

                wko_ordeningLayer = L.geoJSON(wko_ordening, {
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', () => {
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
                  onEachFeature: (feature: Feature<Point>, layer: L.Layer) => {
                    layer.on('click', function () {
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

                // wn_vf_xxxLayer: dynamic layer (9 layers)

                ziekenhuizenLayer_rk = L.geoJSON(ziekenhuizen, {
                  pointToLayer: pointToLayerZHrk,
                  onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
                    layer.on('click', () => {
                      actions.selectHospital(feature as Feature<Point>, 'ziekenhuizen');
                    });
                  },
                  name: 'ziekenhuizen',
                } as NamedGeoJSONOptions).addTo(map);
                updateActiveLayers('ziekenhuizen', true); // cannot assign: it's a constant

                selectedMarkersLayer?.addTo(map);

                const baseTree = {
                  label: 'Achtergrondkaart',
                  children: [
                    { label: 'Normaal', layer: pdok_brt_standaard },
                    { label: 'Grijs', layer: pdok_brt_grijs },
                  ],
                } as any; //Control.Layers.TreeObject;

                const overlayTree = [
                  {
                    label: 'Maatschappelijk vastgoed',
                    children: [
                      { 
                        label: 'Zorg',
                        children: [
                          { label: 'Ziekenhuizen', layer: ziekenhuizenLayer_rk },
                          { label: 'Buitenpoliklinieken', layer: polikliniekenLayer_rk },
                          { label: 'Categorale instellingen', layer: categorale_instellingenLayer_rk },
                          { label: 'Verpleging, verzorging en thuiszorg', layer: vvtLayer_rk },
                          { label: 'Geesteljke gezondheidszorg', layer: ggzLayer_rk },
                          { label: 'Gehandicaptenzorg', layer: ghzLayer_rk },
                        ]
                      },
                      { 
                        label: 'Sport',
                        collapsed: true,
                        children: [
                          { label: 'Grijs', layer: pdok_brt_grijs },
                          { label: 'IJsbanen', layer: skatingsLayer },
                          { label: 'Zwembaden', layer: swimmingsLayer },
                        ]
                      },
                    ],
                  },
                  { label: '<div class="leaflet-control-layers-separator"></div>' },
                  {
                    label: 'Energie-potentie',
                    children: [
                      {
                        label: 'Transitievisie Warmte',
                        collapsed: true,
                        children: [{ label: 'Gemeenten', layer: tvwLayer }],
                      },
                      {
                        label: 'Aquathermie - oppervlaktewater (TEO)',
                        collapsed: true,
                        children: [
                          { label: 'TEO potentie *', layer: wateren_potentie_gt1haLayer }
                        ],
                      },
                      {
                        label: 'Aquathermie - afvalwater (TEA)',
                        collapsed: true,
                        children: [
                          { label: 'rioolwaterzuiveringen', layer: rwzisLayer },
                          {
                            label: '<span style="color:#8080FF"><b>&nbsp;&#x23AF;&nbsp;</b>rioolleidingen</span> *',
                            layer: rioolleidingenLayer,
                          },
                          {
                            label: '<span style="color:blue"><b>&nbsp;&#x23AF;&nbsp;</b>effluentleidingen</span>',
                            layer: effluentLayer,
                          },
                        ],
                      },
                      {
                        label: 'Aardgasvrije wijken en warmtenetten',
                        children: [
                          { label: 'Programma Aardgasvrije Wijken', 
                            collapsed: true,
                            children: [
                              { label: 'Programma Aardgasvrije Wijken', layer: gl_wk_buLayer },
                            ]
                          },
                          { label: 'Warmtenetten Vattenfall',
                            collapsed: true,
                            // collapsed: false,
                            children: [
                              // { label: 'Ede WMTS', layer: wn_vf_ede_wmts, },
                              // { label: 'Provincies', layer: provincies_localhost },
                              { label: '(Almere)', layer: null, },
                              { label: '(Amsterdam)', layer: null, },
                              { label: 'Arnhem', layer: wn_vf_arnhemLayer, },
                              { label: 'Ede', layer: wn_vf_edeLayer, },
                              { label: 'Leiden', layer: wn_vf_leidenLayer, },
                              { label: 'Lelystad', layer: wn_vf_lelystadLayer, },
                              { label: 'Nijmegen', layer: wn_vf_nijmegenLayer, },
                              { label: 'Rotterdam', layer: wn_vf_rotterdamLayer, },
                              { label: 'Vlieland', layer: wn_vf_vlielandLayer, },
                            ],
                          },
                          { label: 'Warmtenetten Noord-Brabant',
                            collapsed: true,
                            children: [
                              { label: 'Noord-Brabant - lokaal', layer: warmtenetten_nbr_lokaalLayer },
                              { label: 'Noord-Brabant - infra', layer: warmtenetten_nbr_infraLayer },
                            ],
                          },
                        ],
                      },
                      {
                        label: 'WKO',
                        selectAllCheckbox: false,
                        children: [
                          {
                            label: 'Installaties',
                            selectAllCheckbox: false,
                            collapsed: true,
                            children: [
                              { label: 'WKO grondwaterinfiltratie', layer: wko_gwiLayer },
                              { label: 'WKO grondwaterinfiltratie en -onttrekking', layer: wko_gwioLayer },
                              { label: 'WKO grondwateronttrekking *', layer: wko_gwoLayer },
                              { label: 'WKO gesloten bodemenergiesysteem *', layer: wko_gbesLayer },
                              { label: 'WKO open bodemenergiesystemen', layer: wko_obesLayer },
                              { label: 'WKO installaties *', layer: wko_installatiesLayer },
                            ],
                          },
                          {
                            label: 'Restricties',
                            selectAllCheckbox: false,
                            collapsed: true,
                            children: [
                              { label: '&nbsp; &#x1F7E6; &nbsp;WKO Diepte', layer: wko_diepteLayer },
                              { label: '&nbsp; &#x1F7E9; &nbsp;WKO Natuur *', layer: wko_natuurLayer },
                              { label: '&nbsp; &#x1F7EA; &nbsp;WKO Ordening', layer: wko_ordeningLayer },
                              { label: '&nbsp; &#x1F7E7; &nbsp;WKO SpecProvBeleid *', layer: wko_specprovbeleidLayer },
                              { label: '&nbsp; &#x1F7E8; &nbsp;WKO Verbodsgebieden', layer: wko_verbodLayer },
                            ],
                          },
                        ],
                      },
                    ]
                  },
                  { label: '<div class="leaflet-control-layers-separator" id="PIN"></div>' },
                  { label: '<div id="PIN2">Pin icon here</div>' },
                  { label: '<div class="leaflet-control-layers-separator"></div>' },
                ] as any; // Control.Layers.TreeObject;

                const treeWithlayers = (L.control.layers as any).tree(baseTree, overlayTree, {
                  collapsed: true,
                  // collapsed: false,
                  // collapsed: tree_collapsed,
                });
                treeWithlayers.addTo(map);
              },
            })
          ),

          // the panel on the right
          m('.panel',
            { style: 'position: absolute; top: 0px; left: 70vw; padding: 5px;' },
            [
              // the logos
              m('nav',
                { style: 'width:100%;height:130px;' },
                m('ul.list-inline', [
                  m('li',
                    m('img', {
                      src: logoEVZ,
                      alt: 'logo EVZ',
                      width: '110px',
                    })
                  ),
                  // ((selectedLayer == undefined) || (!isDeltaresLayer(selectedLayer) && !isSyntraalLayer(selectedLayer))) &&
                    m('li.logo', m('img', { src: logoTNO, alt: 'logo TNO', width: '82px' })),
                  selectedLayer && isDeltaresLayer(selectedLayer) && 
                    m('li.logo', m('img', { src: logoDeltares, alt: 'logo Deltares', width: '114px' })),
                  selectedLayer && isSyntraalLayer(selectedLayer) && 
                    m('li.logo', m('img', { src: logoSyntraal, alt: 'logo Syntraal', width: '140px' })),
                ])
              ),
      
              m('h3', 'De zorgduurzaamkaart'),
              // layer title
              selectedLayer && 
                isCareOrCureLayer(selectedLayer) &&
                  selectedLayer && m('h4.title', `Selectie zorgsector: ${layerTitles[selectedLayer] || selectedLayer}`),
              selectedLayer && 
                isSportLayer(selectedLayer) &&
                  selectedLayer && m('h4.title', `Selectie sport: ${layerTitles[selectedLayer] || selectedLayer}`),
              selectedLayer && 
                isEnergyRelatedLayer(selectedLayer) &&
                  selectedLayer && m('h4.title', `Selectie: ${layerTitles[selectedLayer] || selectedLayer}`),
  
              selectedHospital &&
                selectedHospital.properties && [
                  [
                    m('table.hospital-feature-props', [
                      ...Object.keys(selectedHospital.properties)
                        .filter(
                          (key) =>
                            !selectedHospital.properties ||
                            (selectedHospital.properties.hasOwnProperty(key) && key != 'active' && key != 'Locatienummer')
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

              selectedItem && m(InfoPanel, { state, actions }), // InfoPanel shows attributes of selected item

              selectedLayer == 'gl_wk_bu' && [
                m('h5', 'Info aardgasvrije wijken:'),
                m("a#aardgasvrijewijken[href='https://www.aardgasvrijewijken.nl/']", 'Programma Aardgasvrije Wijken'),
              ],


            ],
          ),

          // routekaart information:
          m('.bottom25', [
            selectedLayer && isCureLayer(selectedLayer) && [
              m('.header-routekaart', `Portefeuilleroutekaart ${layerTitles[selectedLayer] || selectedLayer}`),
              m('.text-routekaart',
                `${layerPercentages[selectedLayer][0]} % aangeleverd`
              ),
              m('.text-routekaart', 'Directe CO₂-emissie reductie 2030: 59 %'),
            ],
            selectedLayer && isCareLayer(selectedLayer) && [
              m('.header-routekaart', `Portefeuilleroutekaart ${layerTitles[selectedLayer] || selectedLayer}`),
              m('.text-routekaart',
                `Routekaarten voorlopig: ${layerPercentages[selectedLayer][0]} % van alle organisaties`
              ),
              m('.text-routekaart',
                `Routekaarten definitief / vastgesteld RvB: ${layerPercentages[selectedLayer][1]} % van alle organisaties`
              ),
            ],
            selectedLayer && isCureLayer(selectedLayer!) && [
              m("a#[href='https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/routekaart_status_cure.xlsx']", 
              { style: 'font-weight: bold' },
              'Download overzicht ziekenhuizen (Excel)'),
            ],
            selectedLayer && isCareLayer(selectedLayer!) && [
              // m('.header-routekaart', 'Data'),
              m("a#[href='https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/routekaart_status_care.xlsx']", 
              { style: 'font-weight: bold' },
              'Download overzicht langdurige zorg (Excel)'),
            ],
          ]),

          // legend: five versions
          // selectedLayer && !isCareOrCureLayer(selectedLayer!) && !isTEOLayer(selectedLayer!) && m(Legend_discr, { state, actions }),
          selectedLayer && isCareLayer(selectedLayer!) && m(Legend_care, { state, actions }),
          selectedLayer && isCureLayer(selectedLayer!) && m(Legend_zh, { state, actions }),
          selectedLayer && isTEOLayer(selectedLayer!) && m(Legend_teo, { state, actions }),
          selectedLayer && isTVWLayer(selectedLayer!) && m(Legend_discr, { state, actions }),
          selectedLayer && isVattenfallLayer(selectedLayer!) && m(Legend_discr, { state, actions }),
        ]),
        selectedLayer && isWKOLayer(selectedLayer!) && m('.disclaimer',
          'Data over WKO bronnen is afkomstig van de WKO-bodemenergietool (wkotool.nl). ' +
          'Mogelijk worden niet alle WKO systemen getoond op de kaart omdat het bevoegd gezag niet alle systemen in het LGR registreert'
        ),
      ];
    },
  };
};