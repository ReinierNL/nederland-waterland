// export function(s) that can be used from different places

export const isInstellingLayer = (layername: string): boolean => {
  return layername == 'ziekenhuizen' || layername == 'vvt' || layername == 'ghz' || layername == 'ggz'
}