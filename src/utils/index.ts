import area from '@turf/area';
import centroid from '@turf/centroid';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';
import m from 'mithril';

import care_blue_png from 'url:../assets/Care_icon_blue.png';
import care_darkgreen_png from 'url:../assets/Care_icon_darkgreen.png';
import care_green3_png from 'url:../assets/Care_icon_green_3.png';
import care_purple_png from 'url:../assets/Care_icon_purple.png';

import school_png from 'url:../assets/school_34.png';
import sewage_png from 'url:../assets/sewage_v2a.png';
import skating_png from 'url:../assets/skating.png';
import sports_png from 'url:../assets/sports_33.png';
import swimming_png from 'url:../assets/swimming.png';
import ziekenhuis_darkgreen from 'url:../assets/ziekenhuis_32.darkgreen.png';
import ziekenhuis from 'url:../assets/ziekenhuis_32.png';
import ziekenhuis_red from 'url:../assets/ziekenhuis_32.d_red.png';
import ziekenhuis_green from 'url:../assets/ziekenhuis_32.green.png';
import ziekenhuis_purple from 'url:../assets/ziekenhuis_32.purple.png';

export const formatNumber = (x: number) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatRoundedNumber = (x: number, div = 1) =>
  (Math.round(x * div) / div).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const round = (x: number) => Math.round(100 * x);

export const showDiff = (cur: number, orig: number) => {
  const c = Math.round(cur);
  const o = Math.round(orig);
  const sign = c > o ? '+' : '';
  return c === o
    ? formatNumber(c)
    : `${formatNumber(c)} (${sign}${formatNumber(c - o)}, 
      ${sign}${round((c - o) / o)}%)`;
};

export const showDiffInColumns = (cur: number, orig: number) => {
  const c = Math.round(cur);
  const o = Math.round(orig);
  const sign = c > o ? '+' : '';
  return c === o
    ? [m('td', formatNumber(c))]
    : [
        m('td', formatNumber(c)),
        m('td.left-align[colspan=2]', `(${sign}${formatNumber(c - o)}, ${sign}${round((c - o) / o)}%)`),
      ];
};

/** Convert a number to a color (e.g. for the #births) */
export const getColor = (d: number) =>
  d > 1000
    ? '#8c2d04'
    : d > 500
    ? '#cc4c02'
    : d > 200
    ? '#ec7014'
    : d > 100
    ? '#fe9929'
    : d > 50
    ? '#fec44f'
    : d > 20
    ? '#fee391'
    : d > 10
    ? '#ffffd4'
    : '#fff';

const ziekenhuisSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" stroke="black" stroke-width="4" fill="{mapIconColor}" viewBox="0 0 36 44" width="20" height="20"><path d="M18.664.253a1 1 0 0 0-1.328 0L.328 15.702a1 1 0 0 0-.328.74V44h36V16.443a1 1 0 0 0-.328-.74zM25 29h-4v4a3 3 0 0 1-6 0v-4h-4a3 3 0 0 1 0-6h4v-4a3 3 0 0 1 6 0v4h4a3 3 0 0 1 0 6z"/></svg>';

export const createIcon = (mapIconColor: string) =>
  L.divIcon({
    className: 'leaflet-data-marker',
    html: L.Util.template(ziekenhuisSvg, { mapIconColor }),
    iconAnchor: [12, 12],
    iconSize: [25, 25],
    popupAnchor: [0, -30],
  });

  export const careIconBlue = L.icon({
    className: 'leaflet-data-marker',
    iconUrl: care_blue_png,
    iconAnchor: [16, 16],
    iconSize: [33, 33],
    popupAnchor: [0, -30],
  });
  
  export const careIconDarkGreen = L.icon({
    className: 'leaflet-data-marker',
    iconUrl: care_darkgreen_png,
    iconAnchor: [16, 16],
    iconSize: [33, 33],
    popupAnchor: [0, -30],
  });
  
  export const careIconGreen3 = L.icon({
    className: 'leaflet-data-marker',
    iconUrl: care_green3_png,
    iconAnchor: [16, 16],
    iconSize: [33, 33],
    popupAnchor: [0, -30],
  });
  
  export const careIconPurple = L.icon({
    className: 'leaflet-data-marker',
    iconUrl: care_purple_png,
    iconAnchor: [16, 16],
    iconSize: [33, 33],
    popupAnchor: [0, -30],
  });

  export const schoolIcon = L.icon({
    className: 'leaflet-data-marker',
    iconUrl: school_png,
    iconAnchor: [16, 16],
    iconSize: [34, 34],
    popupAnchor: [0, -30],
  });
  
  export const sewageIcon = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: sewage_png,
  iconAnchor: [17, 10],
  iconSize: [35, 20],
  popupAnchor: [0, -30],
});

export const skatingIcon = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: skating_png,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

export const sportsIcon = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: sports_png,
  iconAnchor: [16, 16],
  iconSize: [33, 33],
  popupAnchor: [0, -30],
});

export const swimmingIcon = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: swimming_png,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

export const ziekenhuisIcon = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: ziekenhuis,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

export const ziekenhuisIconDarkGreen = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: ziekenhuis_darkgreen,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

export const ziekenhuisIconGreen = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: ziekenhuis_green,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

export const ziekenhuisIconPurple = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: ziekenhuis_purple,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

export const ziekenhuisIconRed = L.icon({
  className: 'leaflet-data-marker',
  iconUrl: ziekenhuis_red,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
  popupAnchor: [0, -30],
});

const deg2rad = Math.PI / 180;
const deg2rad2 = Math.PI / 360;

/**
 * Distance between WGS84 coordinates in meters for distances up to 50.000m.
 * @see https://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/
 */
export const simplifiedDistance = (lat0: number, lng0: number, lat1: number, lng1: number) => {
  const x = lat0 - lat1;
  // const y = (lng0 - lng1) * coslat;
  const y = (lng0 - lng1) * Math.cos((lat0 + lat1) * deg2rad2);
  // 111194.92664455873 = R * Math.PI / 180 where R is the radius of the Earth in meter is 6371000
  return 111194.92664455873 * Math.sqrt(x * x + y * y);
};

/** Compute a square bounding box around the provided point */
export const createBoundingBox = (lat: number, lng: number, sizeInMeters: number): [number, number, number, number] => {
  const size = sizeInMeters / 2;
  const f = size / 111194.92664455873; // f = sqrt(x^2 + y^2)
  const dLat = f;
  const dLng = f / Math.cos(lat * deg2rad);
  return [lat - dLat, lng - dLng, lat + dLat, lng + dLng];
};

export const processWater = (lat: number, lng: number, water?: FeatureCollection) => {
  if (!water) return undefined;
  const features = water.features
    .filter((f) => f.geometry.type !== 'Point')
    .map((f) => {
      const fArea = f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon' ? area(f) : 0;
      const center = fArea > 0 ? centroid(f) : undefined;
      const distance = center
        ? simplifiedDistance(center.geometry.coordinates[1], center.geometry.coordinates[0], lat, lng)
        : 0;
      if (!f.properties) f.properties = {};
      if (!f.properties.Shape__Area) f.properties.area = Math.round(fArea);
      f.properties.distance = Math.round(distance);
      return f;
    })
    .filter((f) => f.properties && (f.properties.Shape__Area > 0 || f.properties.area > 0));
  water.features = features;
  return water;
};

export const capitalize = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1);
