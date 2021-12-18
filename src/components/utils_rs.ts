// export function(s) that can be used from different places

export const isCareLayer = (layername: string): boolean => {
  return layername == 'vvt' || layername == 'ghz' || layername == 'ggz'
}

export const isCategoralLayer = (layername: string): boolean => {
  return layername == 'categorale_instellingen'
}

export const isCureLayer = (layername: string): boolean => {
  return layername == 'ziekenhuizen' || layername == 'poliklinieken' || layername == 'categorale_instellingen'
}

export const isCareOrCureLayer = (layername: string): boolean => {
  return isCareLayer(layername) || isCategoralLayer(layername) || isCureLayer(layername)
}

export const isDeltaresLayer = (layername: string): boolean => {
  return layername == 'wateren_potentie_gt1ha'
}

export const isEnergyRelatedLayer = (layername: string): boolean => {
  return !isCareOrCureLayer(layername) && !isSportLayer(layername)
}

export const isSportLayer = (layername: string): boolean => {
  return layername == 'skating' || layername == 'swimming'
}

export const isSyntraalLayer = (layername: string): boolean => {
  return layername == 'rwzis' || layername == 'effluent' || layername == 'rioolleidingen'
}

export const isTEOLayer = (layername: string): boolean => {
  return layername.substring(0, 8) == 'wateren_'
}

export const isTVWLayer = (layername: string): boolean => {
  return layername == 'tvw'
}

export const isVattenfallLayer = (layername: string): boolean => {
  return layername.substring(0, 5) == 'wn_vf'
}

export const isWKOLayer = (layername: string): boolean => {
  return layername.substring(0, 4) == 'wko_'
}

