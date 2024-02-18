"use client";
import "./globals.css";
import * as d3 from "d3";
import * as topojson from "topojson";
import { useEffect, useState } from "react";
import { br } from "./br-data";
import { states } from "./states";
import { mdiMapMarkerRadius, mdiFileChart, mdiCompare, mdiCharity, mdiArrowLeft } from '@mdi/js';
import { Card, Typography, CardContent, CardActions, IconButton, Button  } from '@mui/material';
import Icon from '@mdi/react';
import { cities } from "./cities";
import { county } from "./county";

export default function Home() {
  const [nameButton, setNameButton] = useState("");
  const [clickBack, setClickBack] = useState(false);
  const [index, setIndex] = useState(0);
  const [travelPath, setTravelPath] = useState([
    
    {
      name: "", 
      func: null, 
      event: null, 
      d: null
    },
    {
      name: "", 
      func: null, 
      event: null, 
      d: null
    },
    {
      name: "", 
      func: null, 
      event: null, 
      d: null
    }
  ]);

  const exec = () => {
    setClickBack(true);
    const func: any = travelPath[index]["func"];

    func(travelPath[index]["event"], travelPath[index]["d"]);
  }

  useEffect(() => {

    let ufSelected: string;
    let namemapState: any;
    let valuemapState: any;
    let stateSelected: any;
    const width: any = 863;
    const height: any = 647;
    const colorsCustom = ["#71D46C", "#EBBB07", "#D43230"];
    const color: any = d3.scaleSequential().domain([1, 27])
      .interpolator(d3.interpolateRgbBasis(colorsCustom));

    const svg: any = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; background: #CBCBCB");

    function travel(index: number, name: string, func: any, event: any, d: any) {
      travelPath[index]["name"] = name;
      travelPath[index]["func"] = func;
      travelPath[index]["event"] = event;
      travelPath[index]["d"] = d;
    }

    const g: any = svg.append("g");

    var projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width, height], topojson.feature(br, br.objects.uf));
    
    const path: any = d3.geoPath().projection(projection);
    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

    function configMap(data: any, dataColors:any, localData:any, dataBorder: any, localMap: any) {
      g.append("g")
        .attr("fill", "#BEC0CC")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(data.features)
        .join("path")
          .attr("fill", dataColors)
          .on("click", localMap)
          .attr("d", path)
        .append("title").text(localData);
    
      g.append("path")
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("d", path(dataBorder));

    }

    function zoomIn() {
      cardZoom("black");
      svg.transition()
        .duration(750)
        .call(
          zoom.scaleBy, 1.4
        ); 
    }

    function zoomOut() {
      if (d3.zoomTransform(svg.node()).k === 1) {
        cardZoom("#BEC0CC");
      }
      svg.transition()
        .duration(750)
        .call(
          zoom.scaleBy, 1 / 1.4
        ); 
    }

    function cardZoom(color: any) {
      svg.append("rect")
        .attr("x", 535)
        .attr("y", 588)
        .attr("width", 315)
        .attr("height", 48)
        .attr("padding", 4)
        .attr("rx", 4) 
        .attr("ry", 4)
        .attr("fill", "#FFFFFF")
        .attr("cursor", "pointer");

      svg.append("image")
        .attr("x", 550)  
        .attr("y", 599) 
        .attr("height", 28)
        .attr("cursor", "pointer")
        .on("click", zoomIn)
        .attr("xlink:href", "map/magnify-plus.svg"); 

      svg.append("image")
        .attr("x", 605)  
        .attr("y", 599) 
        .attr("height", 28)
        .attr("padding", 28)
        .attr("cursor", "pointer")
        .on("click", zoomOut)
        .attr("xlink:href", "map/magnify-minus.svg")

      svg.append("line")
        .attr("x1", 650)  
        .attr("y1", 604)  
        .attr("x2", 650) 
        .attr("y2", 621) 
        .attr("stroke", "#BEC0CC") 
        .attr("stroke-width", 1);
      
      svg.append("text")
        .attr("x", 675)  
        .attr("y", 618) 
        .attr("font-weight", "700")
        .attr("fill", color) 
        .attr("cursor", "pointer")
        .on("click", brasil)
        .text("Redefinir Visualização");
    }

    function brasil() {
      const valuemap = new Map(states.map((d: { id: string, region: number }) => [d.id, d.region]));
      const data: any = topojson.feature(br, br.objects.uf);
      configMap(data, (d: any) => color(valuemap.get(d.id)), (d: any) => `${d.properties.regiao}\n${valuemap.get(d.id)}`, topojson.mesh(br, br.objects.uf, (a, b) => a !== b), region);
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );

      cardZoom("#BEC0CC");
      if (clickBack === false) {
        travel(0, "Brasil", brasil, null, null);
      }

      setNameButton("");
      setIndex(0);
    }

    function region(event: any, d: any) {
      const [[x0, y0], [x1, y1]] = path.bounds(d);
      const filtredStates = states.filter((a: any) => a.nameRegion === d.properties.regiao);
      const valuemap = new Map(filtredStates.map((d: { id: string, value: number }) => [d.id, d.value]));
      const data: any = topojson.feature(br, br.objects.uf);
      event.stopPropagation();
      configMap(data, (d: any) => color(valuemap.get(d.id)), (d: any) => `${d.properties.name}\n${valuemap.get(d.id)}`, topojson.mesh(br, br.objects.uf, (a, b) => a !== b), state);
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
              2
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        );

      cardZoom("black");
      if (clickBack === false) {
        travel(1, d.properties.regiao, region, event, d);
      }

      setIndex(0);
      setNameButton(travelPath[0]["name"]);

    }

    function city(event: any, d: any) {
      const [[x0, y0], [x1, y1]] = path.bounds(d);
      const citiesSelected: any = cities.filter((a: any) => a.uf === ufSelected)[0]
      const dataFeatureCity: any = topojson.feature(citiesSelected["data"], citiesSelected["data"].objects[citiesSelected.id])
      const countyFiltred = county.filter((a: any) => a.cod === d.properties.cod)
      const valuemapCity = new Map(countyFiltred.map((b: { cod: number, valor: number }) => [b.cod, b.valor]));
      const namemapCity = new Map(countyFiltred.map((b: { cod: number, nome: string }) => [b.cod, b.nome]));
      event.stopPropagation();
      
      configMap(dataFeatureCity, (d: any) => color(valuemapCity.get(d.properties.cod)), (d: any) => `${namemapState.get(d.properties.cod)}\n${valuemapState.get(d.properties.cod)}`, topojson.mesh(stateSelected["data"], stateSelected["data"].objects[stateSelected.id], (a, b) => a !== b), state);
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
              Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        );

      cardZoom("black");

      setIndex(2);
      setNameButton(travelPath[2]["name"]);

    }

    function state(event: any, d: any) {
      const [[x0, y0], [x1, y1]] = path.bounds(d);
      stateSelected = cities.filter((uf: any) => uf.uf === d.id)[0]
      const dataFeatureCities: any = topojson.feature(stateSelected["data"], stateSelected["data"].objects[stateSelected.id])
      valuemapState = new Map(county.map((b: { cod: number, valor: number }) => [b.cod, b.valor]));
      namemapState = new Map(county.map((b: { cod: number, nome: string }) => [b.cod, b.nome]));
      const namemapStateId: any = new Map(cities.map((b: { uf: string, state: string }) => [b.uf, b.state]));
      ufSelected = d.id;
      event.stopPropagation();
      g.selectAll("path").style("fill", "#BEC0CC");
      configMap(dataFeatureCities, (a: any) => color(valuemapState.get(a.properties.cod)), (a: any) => `${namemapState.get(a.properties.cod)}\n${valuemapState.get(a.properties.cod)}`, topojson.mesh(stateSelected["data"], stateSelected["data"].objects[stateSelected.id], (a, b) => a !== b), city)
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
              Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        );

      cardZoom("black");

      if (clickBack === false) {
        travel(2, namemapStateId.get(d.id), state, event, d);
      }

      setIndex(1);
      setNameButton(travelPath[1]["name"]);
      
    }

    function zoomed(event: any) {
      const { transform } = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);
    }

    brasil();

    svg.call(zoom);

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
      <Card sx={{ width: 690, height: "auto", boxShadow: "none", border: "1px solid #DCDDE6" }}>
        <Typography variant="h3" sx={{ fontSize: "16px", fontWeight: 600, color: "#252833", display: "flex", justifyContent: "start", alignItems: "center", padding: "15px 15px 0 15px" }} >
          <Icon path={mdiMapMarkerRadius} size={0.8} className="icon-option" />
          Geoanálise
        </Typography>
        <CardActions>
          <Button sx={{ fontSize: "14px", fontWeight: 500, color: "#252833", textTransform: "none", letterSpacing: "none" }}>
            Visualizar
          </Button>
          <Button sx={{ fontSize: "14px", fontWeight: 500, color: "#252833", textTransform: "none", letterSpacing: "none" }}>
            <Icon path={mdiFileChart} size={0.6} className="icon-option" />
            Escore
          </Button>
          <Button sx={{ fontSize: "14px", fontWeight: 500, color: "#252833", textTransform: "none", letterSpacing: "none" }}>
            <Icon path={mdiCompare} size={0.6} className="icon-option" />
            Comparativo
          </Button>
          <Button sx={{ fontSize: "14px", fontWeight: 500, color: "#252833", textTransform: "none", letterSpacing: "none" }}>
            <Icon path={mdiCharity} size={0.6} className="icon-option" />
            Avaliados no Programa
          </Button>
        </CardActions>
        <CardContent sx={{ padding: "0 15px" }}>
          <div id="map" className="map">
          <CardActions sx={{ position: "fixed", margin: "5px" }}>
            {nameButton !== "" && (
              <Button onClick={exec} sx={{ display: "flex", alignItems: "center", width: "auto", height: "14px", padding: "20px", background: "#FFFFFF", borderRadius: "4px", fontWeight: 700, fontSize: "14px", color: "#404554", textTransform: "none", letterSpacing: "none" }}>
                <Icon path={mdiArrowLeft} size={0.9} style={{ marginRight: "8px" }} />
                { nameButton }
              </Button>
            )}
          </CardActions>
          </div>
        </CardContent>
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
      </Card>
    </div>
  );
}
