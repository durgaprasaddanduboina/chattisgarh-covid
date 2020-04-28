export const MAP_TYPES = {
  COUNTRY: 'country',
  STATE: 'state',
  DISTRICT: 'district',
  ZONES: 'ZONE',
  BLOCKS: 'block'
};

export const MAPS_DIR = './maps';

export const mapMeta = {
  'Chattisgarh_District': {
    name: 'Chattisgarh_District',
    geoDataFile: `${MAPS_DIR}/Chattisgarh_District.json`,
    mapType: MAP_TYPES.STATE,
    graphObjectName: 'Chattisgarh_District',
    center: [81.8661, 21.2787],
    viewBox: [0, -100, 1000, 550],
    scale: 8000
  }
};

export const initialMap = mapMeta['Chattisgarh_District'];