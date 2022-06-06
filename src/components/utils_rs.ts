// export function(s) that can be used from different places

export const activeLayersAsString = (activeLayers: Set<string>): string => {
  var s = '';
  activeLayers.forEach(
    function(item) {
      s = s + item + ','
    }
  );
  return s
}

export const containsTEOLayer = (activeLayers: Set<string>): boolean => {
  const sActiveLayers = activeLayersAsString(activeLayers);
  return sActiveLayers!.includes('wateren_')
}

export const isCareLayer = (layerName: string): boolean => {
  return layerName == 'vvt' || layerName == 'ghz' || layerName == 'ggz'
}

export const isCategoralLayer = (layerName: string): boolean => {
  return layerName == 'categorale_instellingen'
}

export const isCureLayer = (layerName: string): boolean => {
  return layerName == 'ziekenhuizen' || layerName == 'poliklinieken' || layerName == 'categorale_instellingen'
}

export const isCareOrCureLayer = (layerName: string): boolean => {
  return isCareLayer(layerName) || isCategoralLayer(layerName) || isCureLayer(layerName)
}

export const isDeltaresLayer = (layerName: string): boolean => {
  return layerName == 'wateren_potentie_gt1ha'
}

export const isEnergyRelatedLayer = (layerName: string): boolean => {
  return !isCareOrCureLayer(layerName) && !isSportLayer(layerName)
}

export const isSportLayer = (layerName: string): boolean => {
  return layerName == 'skating' || layerName == 'swimming'
}

export const isSyntraalLayer = (layerName: string): boolean => {
  return layerName == 'rwzis' || layerName == 'effluent' || layerName == 'rioolleidingen'
}

export const isTEOLayer = (layerName: string): boolean => {
  return layerName.substring(0, 8) == 'wateren_'
}

export const isTVWLayer = (layerName: string): boolean => {
  return layerName == 'tvw'
}

export const isVattenfallLayer = (layerName: string): boolean => {
  return layerName.substring(0, 5) == 'wn_vf'
}

export const isWKOLayer = (layerName: string): boolean => {
  return layerName.substring(0, 4) == 'wko_'
}

export const isWZVLayer = (layerName: string): boolean => {
  return layerName == 'wzv'
}

