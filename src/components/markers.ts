// In this source file all pointToLayerXxx functions, which return a Marker (icon)
// are gathered, so they can be imported by other modules that need them (at the time
// of writing those modules are app-state and home-page)
// Note that in Leaflet, such an icon is also called a Layer

import { Feature, Point } from 'geojson';
import L from 'leaflet';
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
};

// export const pointToTitledLayer = (feature: Feature<Point, any>, latlng: L.LatLng): L.Marker<any> => {
// }; // pointToTitledLayer
// has been moved to layer_generators.ts

