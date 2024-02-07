"use client";
import "./globals.css";
import * as d3 from "d3";
import { data } from "./data";
import { us } from "./us";
import * as topojson from "topojson";
import { useCallback, useEffect } from "react";
import { br } from "./br-data";
import { states } from "./states";
import Icon from '@mdi/react';
import { mdiMapMarkerRadius, mdiFileChart, mdiCompare, mdiCharity  } from '@mdi/js';

export default function Home() {
  useEffect(() => {
    const width: any = 863;
    const height: any = 647;
    const colorsCustom = ["#71D46C", "#EBBB07", "#D43230"];
    const color: any = d3.scaleSequential().domain([1, 27])
      .interpolator(d3.interpolateRgbBasis(colorsCustom));
    const valuemap = new Map(states.map((d: { id: string, region: number }, index: number) => [d.id, d.region]));

    // const zoom = d3.zoom().scaleExtent([1, 50]).on("zoom", zoomed);
    var projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width, height], topojson.feature(br, br.objects.uf));

    const svg: any = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; background: #CBCBCB");
    // .on("click", reset);

    const path: any = d3.geoPath().projection(projection);

    const g: any = svg.append("g");

    /////////////////////////////////////////////////////////
    const data: any = topojson.feature(br, br.objects.uf);
    /////////////////////////////////////////////////////////

    // g.append("g")
    //   .attr("fill", "#444")
    //   .attr("cursor", "pointer")
    //   .selectAll("path")
    //   .data(data.features)
    //   .join("path")
    //   // .on("click", clicked)
    //   .attr("d", path);

    // svg.append("g")
    //   .attr("transform", "translate(610,20)")
    //   .append(() => Legend(color, {title: "Unemployment rate (%)", width: 260}));

    svg.append("g")
      .attr("cursor", "pointer")
      .selectAll("path")
      .data(data.features)
      .join("path")
        .attr("fill", (d: any) => color(valuemap.get(d.id)))
        .attr("d", path)
      .append("title").text((d: any) => valuemap.get(d.id));

    svg.append("path")
      .datum(topojson.mesh(br, br.objects.uf, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    // g.append("path")
    //   .attr("fill", "none")
    //   .attr("stroke", "white")
    //   .attr("stroke-width", 0.2)
    //   .attr("stroke-linejoin", "round")
    //   .attr("d", path(topojson.mesh(br, br.objects.uf, (a, b) => a !== b)));

    // svg.call(zoom);

    // function reset() {
    //   states.transition().style("fill", null);
    //   svg
    //     .transition()
    //     .duration(750)
    //     .call(
    //       zoom.transform,
    //       d3.zoomIdentity,
    //       d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    //     );
    // }

    // function clicked(event: any, d: any) {
    //   const [[x0, y0], [x1, y1]] = path.bounds(d);
    //   event.stopPropagation();
    //   states.transition().style("fill", null);
    //   d3.select(this).transition().style("fill", "red");
    //   svg
    //     .transition()
    //     .duration(750)
    //     .call(
    //       zoom.transform,
    //       d3.zoomIdentity
    //         .translate(width / 2, height / 2)
    //         .scale(
    //           Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
    //         )
    //         .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
    //       d3.pointer(event, svg.node())
    //     );
    // }

    function zoomed(event: any) {
      const { transform } = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
    }

    const mapa: any = document.getElementById("map");
    mapa.append(svg.node());
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card-map">
        <div className="row-title">
          <Icon path={mdiMapMarkerRadius} size={0.8} className="icon-option" />
          <h4 className="title-geo">
            Geoanálise
          </h4>
        </div>
        <div className="row-options">
          <button className="select-option">
            Visualizar
          </button>
          <button className="select-option">
            <Icon path={mdiFileChart} size={0.7} className="icon-option" />
            Escore
          </button>
          <button className="select-option">
            <Icon path={mdiCompare} size={0.7} className="icon-option" />
            Comparativo
          </button>
          <button className="select-option">
            <Icon path={mdiCharity} size={0.7} className="icon-option" />
            Avaliados no Programa
          </button>
        </div>
        <div className="map" id="map"></div>
        <div className="legend">
          <div className="col-title">
            <h5 className="title-legend">Legenda</h5>
          </div>
          <div className="legend-map">
            <div className="col-legend">
              <div className="block1"></div>
              <p className="p-legend">Baixo Risco</p>
            </div>
            <div className="col-legend">
              <div className="block2"></div>
              <p className="p-legend">Médio Risco</p>
            </div>
            <div className="col-legend">
              <div className="block3"></div>
              <p className="p-legend">Alto Risco</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
