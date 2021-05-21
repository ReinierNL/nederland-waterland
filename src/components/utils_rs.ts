// export function(s) that can be used from different places

export const isCareLayer = (layername: string): boolean => {
  return layername == 'vvt' || layername == 'ghz' || layername == 'ggz'
}

export const isCureLayer = (layername: string): boolean => {
  return layername == 'ziekenhuizen' || layername == 'poliklinieken'
}

export const isCareOrCureLayer = (layername: string): boolean => {
  return isCareLayer(layername) || isCureLayer(layername)
}
