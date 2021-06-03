// In this source file all pointToLayerXxx functions, which return a Marker (icon)
// are gathered, so they can be imported by other modules that need them (at the time
// of writing those modules are app-state and home-page)
// Note that in Leaflet, such an icon is also called a Layer

import { Feature, Point } from 'geojson';
import L from 'leaflet';
import {
    careIconGreen,
    careIconPurple,
    careIconRed,
    sewageIcon,
    skatingIcon,
    swimmingIcon,
    ziekenhuisIconGreen,
    ziekenhuisIconPurple,
    ziekenhuisIconRed,
  } from '../utils';
  

export const pointToLayerCare = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
    var layerIcon = careIconRed;
    if (feature.properties && feature.properties['Routekaart']) {
        if (feature.properties['Routekaart'] == 'Concept ingeleverd') {
        layerIcon = careIconPurple;
        } else {
        layerIcon = careIconGreen;   // does not occur yet
        }
    }
    return new L.Marker(latlng, {
        icon: layerIcon,
        title: feature.properties.Naam,
    });
};

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
};

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
};

export const pointToLayerSewage = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
    return new L.Marker(latlng, {
        icon: sewageIcon,
        title: feature.properties.Name,
    });
};

export const pointToLayerSkating = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
    return new L.Marker(latlng, {
        icon: skatingIcon,
        title: feature.properties.Naam,
    });
};

export const pointToLayerSwimming = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
    return new L.Marker(latlng, {
        icon: swimmingIcon,
        title: feature.properties.naam,
    });
};

export const pointToLayerZHrk = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
    // for the ziekenhuizen_routekaarten layer: return green, orange or red icon
    var layerIcon = ziekenhuisIconRed;
    if (feature.properties && feature.properties['Routekaart']) {
        if (feature.properties['Routekaart'] == 'Concept ingeleverd') {
        layerIcon = ziekenhuisIconPurple;
        } else {
        layerIcon = ziekenhuisIconGreen;
        }
    }
    return new L.Marker(latlng, {
        icon: layerIcon,
        title: feature.properties.Naam,
    });
};


export const pointToTitledLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
    // intended purpose: let the feature have a title that is shown when mouse is hovered over the feature
    // but.. it doesn't seem to work
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
};
