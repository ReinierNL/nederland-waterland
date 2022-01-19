import { LatLng } from 'leaflet';

import prov_cogs from '../data/prov_cogs.json';

export const get_nearest_province = (ll: LatLng) => {
  let found_prov = 'nowhere';
  let min_sqrdist = 100
  Object.keys(prov_cogs).forEach( function(key) {
    let y = prov_cogs[key][0]
    let x = prov_cogs[key][1]
    let dx = x - ll.lng
    let dy = (y - ll.lat) / 0.6    // divide by cos(53) (approximately)
    let sqrdist = dx*dx + dy*dy
    if (sqrdist < min_sqrdist) {
        min_sqrdist = sqrdist
        found_prov = key
    }
  })
  return found_prov
}

