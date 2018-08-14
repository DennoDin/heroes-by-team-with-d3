// const d3 = require("d3");
const axios = require("axios");

async function getHeroes() {
  const response = axios.get('https://api.opendota.com/api/heroes');
  console.log(response);
}

// getHeroes();

///d3 portion below///

dataset = {
  "children": [{
    Name: "Rubick",
    Count: "1000"
  }]
};

const diameter = 600;
const color = d3.scaleOrdinal(d3.schemeCategory20);

const bubble = d3.pack(dataset)
  .size([diameter, diameter])
  .padding(1.5);

const svg = d3.select("body")
  .append("svg")
  .attr("width", diameter)
  .attr("height", diameter)
  .attr("class", "bubble");

const nodes = d3.hierarchy(dataset)
  .sum(function (d) { return d.Count; });

const node = svg.selectAll(".node")
  .data(bubble(nodes).descendants())
  .enter()
  .filter(function (d) {
    return !d.children
  })
  .append("g")
  .attr("class", "node")
  .attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

node.append("title")
  .text(function (d) {
    return d.Name + ": " + d.Count;
  });

node.append("circle")
  .attr("r", function (d) {
    return d.r;
  })
  .style("fill", function (d, i) {
    return color(i);
  });

node.append("text")
  .attr("dy", ".2em")
  .style("text-anchor", "middle")
  .text(function (d) {
    return d.data.Name.substring(0, d.r / 3);
  })
  .attr("font-family", "sans-serif")
  .attr("font-size", function (d) {
    return d.r / 5;
  })
  .attr("fill", "white");

node.append("text")
  .attr("dy", "1.3em")
  .style("text-anchor", "middle")
  .text(function (d) {
    return d.data.Count;
  })
  .attr("font-family", "Gill Sans", "Gill Sans MT")
  .attr("font-size", function (d) {
    return d.r / 5;
  })
  .attr("fill", "white");

d3.select(self.frameElement)
  .style("height", diameter + "px");


