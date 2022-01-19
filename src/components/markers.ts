// In this source file all pointToLayerXxx functions, which return a Marker (icon)
// are gathered, so they can be imported by other modules that need them (at the time
// of writing those modules are app-state and home-page)
// Note that in Leaflet, such an icon is also called a Layer

import { Feature, Point } from 'geojson';
import L from 'leaflet';

import { actions } from '../services/meiosis';
import {
  careIconGreen1,
  careIconGreen2,
  careIconGreen3,
  careIconGreen4,
  careIconPurple,
  careIconGreen1CC,
  careIconGreen2CC,
  careIconGreen3CC,
  careIconGreen4CC,
  careIconPurpleCC,
  careIconRed,
  sewageIcon,
  skatingIcon,
  swimmingIcon,
  ziekenhuisIconGreen,
  ziekenhuisIconPurple,
  ziekenhuisIconRed,
} from '../utils';
import { isCareLayer } from '../components/utils_rs';
  

export const highlightMarker = (selectedMarkersLayer: L.GeoJSON, f: Feature, layerName: string = '', primarySelection = true) => {
  // returns a function that creates a blue circle (as highlight) around a (selected) feature
  // and attaches an onclick handler if the layer of the feature is a care layer
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
}; // highlightMarker

export const pointToGrayCircleMarkerLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  const marker = new L.CircleMarker(latlng, {
    radius: 10,
    stroke: false,
    fillColor: 'gray',
    fillOpacity: 0.6,
  });
  feature.properties && feature.properties.PC6 && marker.bindTooltip(feature.properties.PC6);
  return marker;
}; // pointToGrayCircleMarkerLayer

export const pointToGreenCircleMarkerLayer = (_feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    stroke: false,
    fillColor: 'green',
    fillOpacity: 0.8,
  });
}; // pointToGreenCircleMarkerLayer

export const pointToLayerCare = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  var layerIcon = careIconRed;
  var ambitie = null
  var status = null
  if (feature.properties && feature.properties['Ambitie']) {
    ambitie = feature.properties['Ambitie'];
  }
  if (feature.properties && feature.properties['Routekaart']) {
    status = feature.properties['Routekaart'];
  }
  // in practice, status and ambitie are always both true or both false
  if (status && ambitie && status == 'Voorlopig') {
    layerIcon = (ambitie == 'Niet bekend')
              ? careIconPurple
              : (ambitie == 'EM ingepland')
              ? careIconGreen4
              : (ambitie == 'Route tot +-2025')
              ? careIconGreen3
              : (ambitie == 'Route tot 2030')
              ? careIconGreen2
              : (ambitie == 'Route tot 2050')
              ? careIconGreen1
              : careIconRed;
  }
  if (status && ambitie && status == 'Vastgesteld') {
    layerIcon = (ambitie == 'Niet bekend')
              ? careIconPurpleCC
              : (ambitie == 'EM ingepland')
              ? careIconGreen4CC
              : (ambitie == 'Route tot +-2025')
              ? careIconGreen3CC
              : (ambitie == 'Route tot 2030')
              ? careIconGreen2CC
              : (ambitie == 'Route tot 2050')
              ? careIconGreen1CC
              : careIconRed;
  }
  return new L.Marker(latlng, {
    icon: layerIcon,
    title: feature.properties.Naam,
  });
}; // pointToLayerCare

export const pointToLayerGreenCircleMarker = (
  _feature: Feature<Point, any>,
  latlng: L.LatLng
  ): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    stroke: false,
    fillColor: 'green',
    fillOpacity: 0.8,
  });
}; // pointToLayerGreenCircleMarker

export const pointToLayerPurpleCircleMarker = (
  _feature: Feature<Point, any>,
  latlng: L.LatLng
  ): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    stroke: false,
    fillColor: 'purple',
    fillOpacity: 0.8,
  });
}; // pointToLayerPurpleCircleMarker

export const pointToLayerSewage = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  return new L.Marker(latlng, {
    icon: sewageIcon,
    title: feature.properties.Name,
  });
}; // pointToLayerSewage

export const pointToLayerSkating = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  return new L.Marker(latlng, {
    icon: skatingIcon,
    title: feature.properties.Naam,
  });
}; // pointToLayerSkating

export const pointToLayerSwimming = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  return new L.Marker(latlng, {
    icon: swimmingIcon,
    title: feature.properties.naam,
  });
}; // pointToLayerSwimming

export const pointToLayerZHrk = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  // for the ziekenhuizen_routekaarten layer: return green, orange or red icon
  var layerIcon = ziekenhuisIconRed;
  if (feature.properties && feature.properties['Routekaart']) {
    if (feature.properties['Routekaart'] == 'Voorlopig') {
      layerIcon = ziekenhuisIconPurple;
    } else {
      layerIcon = ziekenhuisIconGreen;
    }
  }
  return new L.Marker(latlng, {
    icon: layerIcon,
    title: feature.properties.Naam,
  });
}; // pointToLayerZHrk

// export const pointToTitledLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
// }; // pointToTitledLayer
// has been moved to layer_generators.ts

export const pointToYellowCircleMarkerLayer = (_feature: Feature<Point, any>, latlng: L.LatLng): L.CircleMarker<any> => {
  return new L.CircleMarker(latlng, {
    radius: 5,
    weight: 1,
    color: 'orange',
    fillColor: 'yellow',
    fillOpacity: 0.8,
  });
}; // pointToYellowCircleMarkerLayer
