import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {legendColor} from 'd3-svg-legend';
import * as topojson from 'topojson';
// import {MAP_TYPES} from '../constants';

const propertyFieldMap = {
  country: 'st_nm',
  state: 'DTName_NEW',
  district: 'Mandal_Nam',
  ZONE: 'ZONE'
};

function ChoroplethMap({
  statistic,
  mapData,
  setHoveredRegion,
  mapMeta,
  changeMap,
  selectedRegion,
  currentHoveredRegionData
}) {
  const choroplethMap = useRef(null);
  const [svgRenderCount, setSvgRenderCount] = useState(0);

  const ready = useCallback(
    (geoData) => {
      d3.selectAll('svg#chart > *').remove();
      const propertyField = propertyFieldMap[mapMeta.mapType];
      const maxInterpolation = 0.8;
      const svg = d3.select(choroplethMap.current);
      const width = +svg.attr('width');
      const height = +svg.attr('height');

      const handleMouseover = (name) => {
        try {
          setHoveredRegion(name, mapMeta);
        } catch (err) {
          console.log('err', err);
        }
      };

      const topology = topojson.feature(
        geoData,
        geoData.objects[mapMeta.graphObjectName]
      );

      const projection = d3.geoMercator();

      // if (mapMeta.mapType === MAP_TYPES.COUNTRY)
      // projection.fitSize([width, height], topology);
      // else
      projection.fitExtent(
        [
          [90, 5],
          [width, height]
        ],
        topology
      );

      const path = d3.geoPath(projection);

      // pop up code
      const pop = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('text-align', 'left')
        .style('width', 'max-content')
        .style('height', 'max-content')
        .style('padding', '2px')
        .style('font-size', '11px')
        .style('font-family', 'sans-serif')
        .style('cursor', 'pointer')
        .style('visibility', 'hidden');
      // .style('background', '#70ACD6');

      let onceTouchedRegion = null;
      const newsvg = svg.append('g');
      newsvg
        .append('g')
        .attr('class', 'states')
        .selectAll('path')
        .data(topology.features)
        .enter()
        .append('path')
        .attr('class', 'path-region')
        .attr('fill', function (d) {
          // const n = parseInt(mapData[d.properties[propertyField]]) || 0;
          const res =
            mapData.filter(
              (state) => d.properties[propertyField] === state.ZONE
            )[0] || 0;
          const n = res && res.Point_Count ? res.Point_Count : 0;
          const color =
            n === 0
              ? 'white'
              : d3.interpolateRgb(
                  '#e2eef7',
                  '#70acd6'
                )((maxInterpolation * n) / (statistic.maxConfirmed || 0.001));
          return color;
        })
        .attr('d', path)
        .attr('pointer-events', 'all')
        .on('mouseover', (d) => {
          console.log(d.properties);
          handleMouseover(d.properties[propertyField]);
          const target = d3.event.target;
          d3.select(target.parentNode.appendChild(target)).attr(
            'class',
            'map-hover'
          );
          // pop up code

          // const value = mapData[d.properties[propertyField]] || 0;
          const value =
            mapData.filter(
              (state) => d.properties[propertyField] === state.ZONE
            )[0] || 0;
          // const label = 'Zone';
          // if (mapMeta.mapType === MAP_TYPES.STATE) {
          //   label = 'Zone ';
          // } else {
          //   label = 'Mandal ';
          // }
          // const html =
          //   "<div style='background:#70ACD6 ;width:max-content;width:250px;font-size:12px'>" +
          //   "<div style='padding:6px;background:#70ACD6 '>" +
          //   '</div>' +
          //   "<div style='background:#70ACD6 ;padding:0px 5px'><p style='font-family:Noto Sans,sans-serif;margin-bottom:3px;margin-top:1px;background:#70ACD6 ;padding:10px 0;'><b style='color:#f5f5f5;padding:10px 40px;background:#70ACD6 ;border-bottom:4px solid #5fbcf8'>Current</b></p></div>" +
          //   "<ul style='list-style-type:none;padding:10px 0 0 0;background:#70ACD6 ;color:#d3d4d6;margin-top:0;margin-bottom:0;width:100%'>" +
          //   "<li style='font-family:Noto Sans,sans-serif;padding:5px 8px'><div style='width:40%;display:inline-block'>" +
          //   label +
          //   "name</div> : <div style='width:60%;display:inline'>" +
          //   d.properties[propertyField] +
          //   '</div></li>' +
          //   "<li style='font-family:Noto Sans,sans-serif;padding:5px 8px'><div style='width:40%;display:inline-block'>Total Reported</div> : <div style='width:60%;display:inline'>" +
          //   value.Point_Count +
          //   '</div></li>' +
          //   "<li style='font-family:Noto Sans,sans-serif;padding:5px 8px'><div style='width:40%;display:inline-block'>Total Recovered</div> : <div style='width:60%;display:inline'>" +
          //   value.Recovered +
          //   '</div></li>' +
          //   "<li style='font-family:Noto Sans,sans-serif;padding:5px 8px'><div style='width:40%;display:inline-block'>Active Cases</div> : <div style='width:60%;display:inline'>" +
          //   (value.Point_Count - value.Recovered - value.Death) +
          //   '</div></li>' +
          //   "<li style='font-family:Noto Sans,sans-serif;padding:5px 8px'><div style='width:40%;display:inline-block'>Death</div> : <div style='width:60%;display:inline'>" +
          //   value.Death +
          //   '</div></li>' +
          //   '</ul>' +
          //   '</div>';
          const html1 =
            "<div style='font-family:sans-serif;background:#70ACD6;width:max-content;width:max-content;border-radius:5px;'>" +
            "<div style='padding:5px 5px 5px 15px;'>" +
            "<p style='color:#f4f4f4;margin-bottom:0;margin-top:2px;'><span style='border-bottom:1px solid #cddeea47;padding-bottom:5px;'>Bengaluru Status</span></p>" +
            "<p style='color:#f4f4f4;margin-bottom:0;'><span style='padding-top:5px;'>Active Cases: </span>" +
            statistic.total +
            '</p>' +
            '</div>' +
            "<ul style='list-style-type:none;padding:0px 0 10px 0;color:#f4f4f4;margin-top:0;margin-bottom:0;width:100%'>" +
            "<li style='padding:0px 15px'><span>Zone: </span>" +
            d.properties[propertyField] +
            '</li>' +
            "<li style='padding:0px 15px'><span>Total Reported: </span>" +
            value.Point_Count +
            '</li>' +
            "<li style='padding:0px 15px'><span>Total Recovered: </span>" +
            value.Recovered +
            '</li>' +
            "<li style='padding:0px 15px'><span>Active Cases: </span>" +
            (value.Point_Count - value.Recovered - value.Death) +
            '</li>' +
            "<li style='padding:0px 15px'><span>Death: </span>" +
            value.Death +
            '</li>' +
            '</ul>' +
            '</div>';
          // pop.style('visibility', 'visible');
          // pop
          //   .html(html1)
          //   .style('left', d3.event.pageX + 'px')
          //   .style('top', d3.event.pageY - 28 + 'px')
          //   .style('position', 'absolute');
        })
        .on('mouseleave', (d) => {
          const target = d3.event.target;
          d3.select(target).attr('class', 'path-region map-default');
          if (onceTouchedRegion === d) onceTouchedRegion = null;
          // pop up code
          pop.style('visibility', 'hidden');
        })
        .on('touchstart', (d) => {
          if (onceTouchedRegion === d) onceTouchedRegion = null;
          else onceTouchedRegion = d;
          // pop up code
          pop.style('visibility', 'hidden');
        })
        .on('click', (d) => {
          // pop up code
          pop.style('visibility', 'hidden');
          if (onceTouchedRegion) {
            return;
          }
          // if (mapMeta.mapType === MAP_TYPES.STATE) {
          //   return;
          // }
          // if (mapMeta.mapType === MAP_TYPES.DISTRICT) {
          //   return;
          // }
          changeMap(d.properties[propertyField], mapMeta.mapType);
        });
      // .append('title')
      // .text(function (d) {
      //   const value = mapData[d.properties[propertyField]] || 0;

      //   // let popup_text = 'Confirmed:' + value + '\n' + ` Active ` + 0;
      //   let label;
      //   if (mapMeta.mapType === MAP_TYPES.STATE) {
      //     label = 'District: ';
      //   } else {
      //     label = 'Mandal: ';
      //   }
      //   const popupText =
      //     label +
      //     toTitleCase(d.properties[propertyField]) +
      //     `` +
      //     `\n` +
      //     `Confirmed: ` +
      //     value +
      //     `\n` +
      //     `Active: 0 \nRecovered: 0 \nDeceased: 0`;
      //   return popupText;

      // const value = mapData[d.properties[propertyField]] || 0;
      // return (
      //   Number(
      //     parseFloat(100 * (value / (statistic.total || 0.001))).toFixed(2)
      //   ).toString() +
      //   '% from ' +
      //   toTitleCase(d.properties[propertyField])
      // );
      // });

      newsvg
        .append('path')
        .attr('stroke', '#508AB3')
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr(
          'd',
          path(topojson.mesh(geoData, geoData.objects[mapMeta.graphObjectName]))
        );

      newsvg
        .append('g')
        .attr('class', 'zoom')
        .selectAll('text')
        .data(topology.features)
        .enter()
        .append('text')
        .attr('class', 'place-label')
        .style('font-size', '14px')
        .style('fill', 'black')
        .style('cursor', 'pointer')
        .attr('x', function (d) {
          return path.centroid(d)[0]-4;
        })
        .attr('y', function (d) {
          return path.centroid(d)[1] + 4;
        })
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'all')
        .text(function (d) {
          const value =
            mapData.filter(
              (state) => d.properties[propertyField] === state.ZONE
            )[0] || 0;
          return value.Point_Count || 0;
        });

      // grid lines code
      // set the ranges
      const x = d3.scaleTime().range([0, window.innerWidth]);
      const y = d3.scaleLinear().range([window.innerHeight, 0]);
      const margin = {top: 0, right: 0, bottom: 0, left: 0};
      const gridWidth = window.innerWidth;
      const gridHeight = window.innerHeight;
      // gridlines in x axis function
      const gridSVG = d3
        .select('#grid')
        .append('svg')
        .style('position', 'absolute')
        .style('top', 0)
        .attr('width', gridWidth + margin.left + margin.right)
        .attr('height', gridHeight + margin.top + margin.bottom)
        .append('g');
      function makeXGridlines() {
        return d3.axisBottom(x).ticks(30);
      }

      // gridlines in y axis function
      function makeYGridlines() {
        return d3.axisLeft(y).ticks(30);
      }
      // add the X gridlines
      gridSVG
        .append('g')
        .attr('class', 'grid')
        .attr('transform', 'translate(0,' + gridHeight + ')')
        .call(makeXGridlines().tickSize(-gridHeight).tickFormat(''));

      // add the Y gridlines
      gridSVG
        .append('g')
        .attr('class', 'grid')
        .attr('stroke', 'white')
        .call(makeYGridlines().tickSize(-gridWidth).tickFormat(''));

      // add the X Axis
      gridSVG
        .append('g')
        .attr('stroke', 'white')
        .attr('transform', 'translate(0,' + gridHeight + ')')
        .call(d3.axisBottom(x));

      // add the Y Axis
      gridSVG.append('g').call(d3.axisLeft(y));

      // custom code
      // const zoom = d3.zoom().scaleExtent([1, 8]).on('zoom', zoomed);
      // function zoomed() {
      //   const {transform} = d3.event;
      //   newsvg.attr('transform', transform);
      //   newsvg.attr('stroke-width', 1);
      //   // newsvg.attr('stroke-width', 1 / transform.k);
      // }
      // function reset() {
      //   svg
      //     .transition()
      //     .duration(750)
      //     .call(
      //       zoom.transform,
      //       d3.zoomIdentity,
      //       d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
      //     );
      // }
      // svg.call(zoom);
    },
    [
      mapData,
      mapMeta,
      statistic.total,
      statistic.maxConfirmed,
      changeMap,
      setHoveredRegion,
      currentHoveredRegionData
    ]
  );

  const toTitleCase = (str) => {
    str = str.toLowerCase().split(' ');
    for (let i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
  };

  const renderData = useCallback(() => {
    const svg = d3.select(choroplethMap.current);

    // Colorbar
    const maxInterpolation = 0.8;
    const color = d3
      .scaleSequential(d3.interpolateRgb('#e2eef7', '#70acd6'))
      .domain([0, statistic.maxConfirmed / maxInterpolation || 10]);

    let cells = null;
    let label = null;

    label = ({i, genLength, generatedLabels, labelDelimiter}) => {
      if (i === genLength - 1) {
        const n = Math.floor(generatedLabels[i]);
        return `${n}+`;
      } else {
        const n1 = 1 + Math.floor(generatedLabels[i]);
        const n2 = Math.floor(generatedLabels[i + 1]);
        return `${n1} - ${n2}`;
      }
    };

    const numCells = 6;
    const delta = Math.floor(
      (statistic.maxConfirmed < numCells ? numCells : statistic.maxConfirmed) /
        (numCells - 1)
    );

    cells = Array.from(Array(numCells).keys()).map((i) => i * delta);
    const legendHeight = window.innerHeight - 150;

    svg
      .append('g')
      .attr('class', 'legendLinear')
      .attr('transform', 'translate(1, ' + legendHeight + ')');

    const legendLinear = legendColor()
      .shapeWidth(36)
      .shapeHeight(10)
      .cells(cells)
      .titleWidth(2)
      .labels(label)
      .title('Reported Cases')
      .orient('vertical')
      .scale(color);

    svg
      .select('.legendLinear')
      .call(legendLinear)
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', 'black');
  }, [statistic.maxConfirmed]);

  useEffect(() => {
    (async () => {
      const data = await d3.json(mapMeta.geoDataFile);
      if (statistic && choroplethMap.current) {
        ready(data);
        renderData();
        setSvgRenderCount((prevCount) => prevCount + 1);
      }
    })();
  }, [mapMeta.geoDataFile, statistic, renderData, ready]);

  const highlightRegionInMap = (name) => {
    const paths = d3.selectAll('.path-region');
    paths.classed('map-hover', (d, i, nodes) => {
      const propertyField =
        'district' in d.properties
          ? propertyFieldMap['state']
          : propertyFieldMap['country']
          ? propertyFieldMap['ZONE']
          : propertyFieldMap['district'];
      if (name === d.properties[propertyField]) {
        nodes[i].parentNode.appendChild(nodes[i]);
        return true;
      }
      return false;
    });
  };

  useEffect(() => {
    highlightRegionInMap(selectedRegion);
  }, [svgRenderCount, selectedRegion]);

  let chartWidth;
  if (window.innerWidth > 1000) {
    chartWidth = window.innerWidth - 300;
  } else if (window.innerWidth > 800 && window.innerWidth < 1000) {
    chartWidth = window.innerWidth - 250;
  } else if (window.innerWidth > 600 && window.innerWidth < 800) {
    chartWidth = window.innerWidth - 200;
  } else if (window.innerWidth > 500 && window.innerWidth < 600) {
    chartWidth = window.innerWidth - 150;
  } else if (window.innerWidth > 400 && window.innerWidth < 500) {
    chartWidth = window.innerWidth - 50;
  }
  const viewBox = [0, 0, chartWidth, window.innerHeight - 50];

  return (
    <div className="svg-container svg-parent">
      <svg
        id="chart"
        width={chartWidth}
        height={window.innerHeight - 50}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        ref={choroplethMap}
      ></svg>
      <div className="map-stats">
        <div className="stats">
          <p>
            <span className="border-bottom">Chhattisgarh Status</span>
          </p>
          {/* <div className="border-bottom"></div> */}
          <div className="stats-bottom">
            <ul>
              <li>
                Active Cases:
                {statistic.total || statistic.total === 0
                  ? statistic.total
                  : 'NA'}
              </li>
              <li>
                District:
                {currentHoveredRegionData.name
                  ? currentHoveredRegionData.name
                  : currentHoveredRegionData.ZONE
                  ? currentHoveredRegionData.ZONE
                  : 'NA'}
              </li>
              <li>
                Total Reported:
                {currentHoveredRegionData.Point_Count ||
                currentHoveredRegionData.Recovered ||
                currentHoveredRegionData.Death
                  ? currentHoveredRegionData.Point_Count +
                    currentHoveredRegionData.Recovered +
                    currentHoveredRegionData.Death
                  : 0}
              </li>
              <li>
                Total Recovered:
                {currentHoveredRegionData.Recovered ||
                currentHoveredRegionData.Recovered === 0
                  ? currentHoveredRegionData.Recovered
                  : 0}
              </li>
              <li>
                Active Cases:
                {currentHoveredRegionData.Point_Count ||
                currentHoveredRegionData.Point_Count === 0
                  ? currentHoveredRegionData.Point_Count
                  : 0}
              </li>
              <li>
                Death:
                {currentHoveredRegionData.Death ||
                currentHoveredRegionData.Death === 0
                  ? currentHoveredRegionData.Death
                  : 0}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoroplethMap;
