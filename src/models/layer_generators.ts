import m from 'mithril';
import { FeatureCollection, Feature, GeoJsonObject, LineString, Point } from 'geojson';
import L, { GeoJSONOptions, LeafletEvent, MarkerClusterGroup, MarkerClusterGroupOptions } from 'leaflet';

import { actions } from '../services/meiosis';
import { NamedGeoJSONOptions } from '../components';
import { toColorFactoryDiscrete, toColorFactoryInterval, toFilterFactory } from '../models';
import { pointToLayerCare, pointToLayerSchools, pointToLayerSports } from '../components/markers'
import { showMainBranchFilter } from './feature-style';


// import { pointToTitledLayer } from '../components/markers'
// this import caused an
// Uncaught ReferenceError: Cannot access 'pointToTitledLayer' before initialization
// the pointToTitledLayer function has been moved to this source file


export interface NamedMarkerClusterGroupOptions extends MarkerClusterGroupOptions {
  name: string;
}

export const createLayerTVW = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  // this is used for the layers of the TransitieVisie Warmte
  // console.log(`createLayerTVW: name=${name}; legendProp=${legendPropName}`)
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
}; // createLayerTVW


export const createLayerVF = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  // this is used for the Vattenfall layers
  // console.log(`createLayerVF: name=${name}; legendProp=${legendPropName}`)
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
}; // createLayerVF


export const createLeafletLayer = (name: string, legendPropName: string, initialData?: GeoJsonObject) => {
  // this is used for the TEO layer (wateren_potentie_gt1ha)
  // console.log(`CreateLeafletLayer: ${name}`);
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
}; // createLeafletLayer


export const createMCG = (name: string, flag: number) => {
  // returns a MarkerClusterGroup that has a name (options.name)
  // console.log(`createMCG. Flag=${flag}`);
  const mcg = new MarkerClusterGroup({name: name } as NamedMarkerClusterGroupOptions);
  return mcg as MarkerClusterGroup
}; // createMCG


export const loadCareLayer = async (layer: string, app: { [key: string]: MarkerClusterGroup|FeatureCollection }) => {
  console.log(`loadCareLayer: ${layer}`);
	const layerName = layer + 'Layer_rk';
	const features = app[layer] ? (app[layer] as FeatureCollection) : undefined;
  var mcg = app[layerName] ? (app[layerName] as MarkerClusterGroup) : undefined;
	if (mcg && features) {
    console.log(`mcg exists and features exist`);
    mcg?.clearLayers()
    L.geoJSON(features, {
      pointToLayer: pointToLayerCare,
      onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
        layer.on('click', () => {
          actions.selectFeature(feature as Feature<Point>, 'vvt');
        });
      },
      name: 'vvt',
    } as NamedGeoJSONOptions).eachLayer((l) => mcg.addLayer(l));
    return mcg as MarkerClusterGroup;
  }
  return {}
}; // loadCareLayer


export const loadGeoJSON = async (layer: string, selectedHospital: Feature, app: { [key: string]: L.GeoJSON }) => {
  // console.log(`loadGeoJSON. layer=${layer}`);
  const layerName = layer + 'Layer';
  const id = (selectedHospital.properties as any).Locatienummer;
  const geojson = app[layerName] ? (app[layerName] as L.GeoJSON) : undefined;
  if (geojson) {
  	// console.log(`process.env.GIS_SERVER: ${process.env.GIS_SERVER}`);
		const the_url = `${process.env.GIS_SERVER || 'https://dezorgduurzaamkaart.expertisecentrumverduurzamingzorg.nl/geojson-server/api/'}${layer}/id/${id}`;
		// console.log(`URL: ${the_url}`);
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
}; // loadGeoJSON
  

export const loadGeoJSON_VF = async (layer: string, app: { [key: string]: L.GeoJSON }) => {
  // loads GeoJson data for a Vattenfall warmtenetten layer, if not already loaded
  // console.log(`LoadGeoJSON_VF`);
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
}; // loadGeoJSON_VF


export const loadMCG = (mcg: MarkerClusterGroup, features: FeatureCollection<Point>, keepMainBranchesOnly: boolean) => {
  // console.log(`loadMCG. mcg.options.name=${mcg.options.name}; kmbo=${keepMainBranchesOnly}`);
  let ptl = pointToLayerCare;
  if ( (mcg.options.name == 'schools') || (mcg.options.name == 'schools PO') || (mcg.options.name == 'schools NPO') )  {
    ptl = pointToLayerSchools
  } else if (mcg.options.name == 'sports') {
    ptl = pointToLayerSports
  } else {
    ptl = pointToLayerCare
  };
  mcg.clearLayers();
  const gj = L.geoJSON(features, {
    filter: showMainBranchFilter(keepMainBranchesOnly),
    pointToLayer: ptl,
    onEachFeature: (feature: Feature<Point, any>, layer: L.Layer) => {
      layer.on('click', () => {
        actions.selectFeature(feature as Feature<Point>, mcg.options.name)
      })
    }
  } as GeoJSONOptions);
  gj.eachLayer((l) => mcg.addLayer(l))
  return mcg as MarkerClusterGroup
}; // loadMCG


const pointToTitledLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  // intended purpose: let the feature have a title that is shown when mouse is hovered over the feature
  // this works for the care and cure layers, the rwzis, sports, but not for the water potential
  // layer (TEO) which is created by createLeafletLayer. 
  // probably because it is not a point layer
  return new L.Marker(latlng, {
    title: feature.properties.Name
         ? feature.properties.Name
         : feature.properties.Naam
         ? feature.properties.Naam
         : feature.properties.NAAM
         ? feature.properties.NAAM
         : '',
  });
}; // pointToTitledLayer
