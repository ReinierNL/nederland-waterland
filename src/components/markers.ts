// In this source file all pointToLayerXxx functions, which return a Marker (icon)
// are gathered, so they can be imported by other modules that need them (at the time
// of writing those modules are app-state and home-page)
// Note that in Leaflet, such an icon is also called a Layer

import { Feature, Point } from 'geojson';
import L from 'leaflet';

import { actions } from '../services/meiosis';
import {
  careIconBlue,
  careIconDarkGreen,
  careIconGreen3,
  careIconPurple,
  schoolIcon,
  sewageIcon,
  skatingIcon,
  sportsIcon,
  swimmingIcon,
  ziekenhuisIconDarkGreen,
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
  let opacity = 1
  // if (feature.properties && !feature.properties['IsMainBranch']) {
  //   return null as unknown as L.Marker 
  //   //opacity = 0
  // }
  var status = null
  var version = null
  if (feature.properties && feature.properties['Routekaart']) {
    status = feature.properties['Routekaart'];
  }
  if (feature.properties && feature.properties['Versie']) {
    version = feature.properties['Versie'];
  }
  var layerIcon = careIconBlue;
  if (status) {
    if (status == 'Actueel en vastgesteld') {
      layerIcon = careIconDarkGreen
    } else if (status == 'Wordt aan gewerkt') {
      layerIcon = careIconPurple
    }
  }
  let newMarker = new L.Marker(latlng, {
    icon: layerIcon,
    title: feature.properties.Naam,
  }); 
  newMarker.options.opacity = opacity
  return newMarker;
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

export const pointToLayerSchools = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  return new L.Marker(latlng, {
    icon: schoolIcon,
    title: feature.properties.Naam,
  });
}; // pointToLayerSchools

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

export const pointToLayerSports = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  return new L.Marker(latlng, {
    icon: sportsIcon,
    title: feature.properties.Naam,
  });
}; // pointToLayerSports

export const pointToLayerSwimming = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  return new L.Marker(latlng, {
    icon: swimmingIcon,
    title: feature.properties.naam,
  });
}; // pointToLayerSwimming

export const pointToLayerZHrk = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
  // for the ziekenhuizen_routekaarten layer: return green, darkgreen, purple or red icon
  var layerIcon = ziekenhuisIconRed;
  if (feature.properties && feature.properties['Routekaart']) {
    if (feature.properties['Geactualiseerd'] && feature.properties['Geactualiseerd'] == 'Ja') {
      layerIcon = ziekenhuisIconGreen;
    }
    else if (feature.properties['Routekaart'] == 'Definitief en/of vastgesteld RvB') {
      layerIcon = ziekenhuisIconDarkGreen;
    }
    else if (feature.properties['Routekaart'] == 'Voorlopig') {
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
