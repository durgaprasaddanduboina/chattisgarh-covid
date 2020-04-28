import React, {useState, useEffect, useMemo, useCallback} from 'react';
import ChoroplethMap from './choropleth';
import {MAP_TYPES, MAPS_DIR, mapMeta,initialMap} from '../constants';
import * as R from 'ramda';
// import {formatDate, formatDateAbsolute} from '../utils/common-functions';
// import {formatDistance} from 'date-fns';



export default function ({states, stateDistrictWiseData, regionHighlighted}) {
  const [selectedRegion, setSelectedRegion] = useState({});
  const [currentHoveredRegion, setCurrentHoveredRegion] = useState({});
  const [currentMap, setCurrentMap] = useState(initialMap);

  // useEffect(() => {}, [states]);

  useEffect(() => {
    const region = getRegionFromState(
      // states.filter((state) => 'Bangalore Zones' === state.state)[0]
      states[0]
    );
    setCurrentHoveredRegion(region);
  }, [states]);

  // useEffect(() => {
  //   if (currentMap.mapType === MAP_TYPES.DISTRICT) {
  //     return;
  //   }

  //   if (stateHighlighted === null) {
  //     highlightRegionInMap(null, currentMap.mapType);
  //   } else {
  //     if (stateHighlighted !== undefined) {
  //       const regionHighlighted = getRegionFromState(stateHighlighted.state);
  //       setCurrentHoveredRegion(regionHighlighted);
  //       highlightRegionInMap(regionHighlighted.name, currentMap.mapType);
  //     }
  //   }
  // }, [stateHighlighted]);

  if (!currentHoveredRegion) {
    return null;
  }

  const [statistic, currentMapData] = useMemo(() => {
    const statistic = {total: 0, maxConfirmed: 0};
    let currentMapData = {};

    if (currentMap.mapType === MAP_TYPES.COUNTRY) {
      currentMapData = states.reduce((acc, state) => {
        if (state.state === 'Total') {
          return acc;
        }
        const confirmed = parseInt(state.confirmed);
        statistic.total += confirmed;
        if (confirmed > statistic.maxConfirmed) {
          statistic.maxConfirmed = confirmed;
        }

        acc[state.state] = state.confirmed;
        return acc;
      }, {});
    } else if (
      currentMap.mapType === MAP_TYPES.STATE ||
      currentMap.mapType === MAP_TYPES.ZONES
    ) {
      // const districtWiseData = (
      //   stateDistrictWiseData[currentMap.name] || {districtData: {}}
      // ).districtData;
      // currentMapData = Object.keys(districtWiseData).reduce((acc, district) => {
      //   const confirmed = parseInt(districtWiseData[district].confirmed);
      //   statistic.total += confirmed;
      //   if (confirmed > statistic.maxConfirmed) {
      //     statistic.maxConfirmed = confirmed;
      //   }
      //   acc[district] = districtWiseData[district].confirmed;
      //   return acc;
      // }, {});
      if (!R.isEmpty(stateDistrictWiseData)) {
        stateDistrictWiseData.reduce((acc, zone) => {
          statistic.total += zone.Point_Count;
          if (zone.Point_Count > statistic.maxConfirmed) {
            statistic.maxConfirmed = zone.Point_Count;
          }
        }, {});
      }
      currentMapData = stateDistrictWiseData || {
        districtData: {}
      };
    }
    return [statistic, currentMapData];
  }, [currentMap, states, stateDistrictWiseData]);

  const setHoveredRegion = useCallback(
    (name, currentMap) => {
      if (currentMap.mapType === MAP_TYPES.COUNTRY) {
        setCurrentHoveredRegion(
          getRegionFromState(states.filter((state) => name === state.state)[0])
        );
      } else if (currentMap.mapType === MAP_TYPES.STATE) {
        // const state = stateDistrictWiseData[currentMap.name] || {
        //   districtData: {}
        // };
        const state = stateDistrictWiseData.filter(
          (state) => name === state.ZONE
        )[0] || {
          districtData: {}
        };
        let districtData = state;
        if (!districtData) {
          districtData = {
            confirmed: 0,
            active: 0,
            deaths: 0,
            recovered: 0
          };
        }
        setCurrentHoveredRegion(getRegionFromDistrict(districtData, name));
      } else if (currentMap.mapType === MAP_TYPES.DISTRICT) {
        const state = stateDistrictWiseData[currentMap.name] || {
          districtData: {}
        };
        let districtData = undefined;
        if (!districtData) {
          districtData = {
            confirmed: 0,
            active: 0,
            deaths: 0,
            recovered: 0
          };
        }
        setCurrentHoveredRegion(getRegionFromDistrict(districtData, name));
      }
    },
    [stateDistrictWiseData, states]
  );

  useEffect(() => {
    if (regionHighlighted === undefined) {
      return;
    } else if (regionHighlighted === null) {
      setSelectedRegion(null);
      return;
    }
    const isState = !('district' in regionHighlighted);
    if (isState) {
      const newMap = mapMeta['Bangalore Zones'];
      setCurrentMap(newMap);
      const region = getRegionFromState(regionHighlighted.state);
      setCurrentHoveredRegion(region);
      setSelectedRegion(region.name);
    } else {
      const newMap = mapMeta[regionHighlighted.state.state];
      if (!newMap) {
        return;
      }
      setCurrentMap(newMap);
      setHoveredRegion(regionHighlighted.district, newMap);
      setSelectedRegion(regionHighlighted.district);
    }
  }, [regionHighlighted, currentMap.mapType, setHoveredRegion]);

  const getRegionFromDistrict = (districtData, name) => {
    if (!districtData) {
      return;
    }
    const region = {...districtData};
    if (!region.name) {
      region.name = name;
    }
    return region;
  };

  const getRegionFromState = (state) => {
    if (!state) {
      return;
    }
    const region = {...state};
    if (!region.name) {
      region.name = region.state;
    }
    return region;
  };

  const switchMapToState = useCallback(
    (name) => {
      let previousMap: any;
      if (currentMap.mapType === MAP_TYPES.STATE) {
        previousMap = 'Bangalore Zones';
      } else if (currentMap.mapType === MAP_TYPES.DISTRICT) {
        previousMap = 'Bangalore Zones';
      }
      const newMap = mapMeta[name];
      if (!newMap) {
        return;
      }
      setCurrentMap(newMap);
      if (newMap.mapType === MAP_TYPES.COUNTRY) {
        setHoveredRegion(states[1].state, newMap);
      } else if (newMap.mapType === MAP_TYPES.STATE) {
        // const districtData = (stateDistrictWiseData[name] || {districtData: {}})
        //   .districtData;
        // const topDistrict = Object.keys(districtData)
        //   .filter((name) => name !== 'Unknown')
        //   .sort((a, b) => {
        //     return districtData[b].confirmed - districtData[a].confirmed;
        //   })[0];
        const stateData = stateDistrictWiseData.filter(
          (state) => name === state.ZONE
        )[0];
        if (stateData) {
          name = name;
        } else {
          name = stateDistrictWiseData[0].ZONE;
        }
        setHoveredRegion(name, newMap);
      } else if (newMap.mapType === MAP_TYPES.DISTRICT) {
        const districtData = (stateDistrictWiseData[name] || {districtData: {}})
          .districtData;
        const topDistrict = Object.keys(districtData)
          .filter((name) => name !== 'Unknown')
          .sort((a, b) => {
            return districtData[b].confirmed - districtData[a].confirmed;
          })[0];
        setHoveredRegion(name, newMap);
      } else if (newMap.mapType === MAP_TYPES.ZONES) {
        const districtData = stateDistrictWiseData[name] || {districtData: {}};
        // const topDistrict = Object.keys(districtData)
        //   .filter((name) => name !== 'Unknown')
        //   .sort((a, b) => {
        //     return districtData[b].confirmed - districtData[a].confirmed;
        //   })[0];
        setHoveredRegion(name, newMap);
      }
    },
    [setHoveredRegion, stateDistrictWiseData, states]
  );
  const {name, lastupdatedtime} = currentHoveredRegion;

  return (
    <div className="MapExplorer fadeInUp" style={{animationDelay: '1.2s'}}>
      {/* <div className="header">
        {/* <h1>{currentMap.name} Map</h1> */}
      {/* <h6>
          Hover over a{' '}
          {currentMap.mapType === MAP_TYPES.COUNTRY ? 'state' : 'district'} for
          more details
        </h6> 
        </div> */}
      <ChoroplethMap
        statistic={statistic}
        mapMeta={currentMap}
        mapData={currentMapData}
        setHoveredRegion={setHoveredRegion}
        changeMap={switchMapToState}
        selectedRegion={selectedRegion}
        currentHoveredRegionData={currentHoveredRegion}
      />
      {/* <div className="map-stats">
        <div className="stats">
          <p>
            <span className="border-bottom">Bengaluru Status</span>
          </p> */}
      {/* <div className="border-bottom"></div> */}
      {/* <div className="stats-bottom">
            <ul>
              <li>Active Cases: {statistic.total}</li>
              <li>
                Zone:
                {currentHoveredRegion.name
                  ? currentHoveredRegion.name
                  : currentHoveredRegion.ZONE}
              </li>
              <li>
                Total Reported:
                {currentHoveredRegion.Point_Count +
                  currentHoveredRegion.Recovered +
                  currentHoveredRegion.Death}
              </li>
              <li>Total Recovered: {currentHoveredRegion.Recovered}</li>
              <li>
                Active Cases:
                {currentHoveredRegion.Point_Count}
              </li>
              <li>Death: {currentHoveredRegion.Death}</li>
            </ul>
          </div> */}
      {/* </div>
      </div> */}

      {/* <div className="stats is-blue">
          <h5>Active</h5>
          <div className="stats-bottom">
            <h1>{currentHoveredRegion.active || ''}</h1>
            <h6>{}</h6>
          </div>
        </div>

        <div className="stats is-green">
          <h5>Recovered</h5>
          <div className="stats-bottom">
            <h1>{currentHoveredRegion.recovered || ''}</h1>
            <h6>{}</h6>
          </div>
        </div>

        <div className="stats is-gray">
          <h5>Deceased</h5>
          <div className="stats-bottom">
            <h1>{currentHoveredRegion.deaths || ''}</h1>
            <h6>{}</h6>
          </div>
        </div>
      </div> */}

      {/* <div className="meta">
        <h2>{currentHoveredRegion.name}</h2>
        {currentMap.mapType === MAP_TYPES.STATE &&
          currentMapData.Unknown > 0 ? (
            <h4 className="unknown">
              Districts unknown for {currentMapData.Unknown} people
            </h4>
          ) : null} */}

      {/* {currentMap.mapType === MAP_TYPES.STATE ? (
          <div
            className="button back-button"
            onClick={() => switchMapToState()}
          >
            Back
          </div>
        ) : null} */}
      {currentMap.mapType === MAP_TYPES.ZONES ? (
        <div
          className="button back-button"
          onClick={() => switchMapToState('Bangalore Zones')}
        >
          Back
        </div>
      ) : null}
      {/* <div
          className="button back-button"
          onClick={() => switchMapToState('Bangalore Zones')}
        >
          Back
        </div> */}
      {/* </div> */}
    </div>
  );
}
