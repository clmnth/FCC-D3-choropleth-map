const countyUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const educationUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

let width = 1000;
let height = 650;
let padding = 40;

let path = d3.geoPath();

// Append an SVG element to the body of the HTML
let svg = d3
  .select("body")
  .append("svg")
  .attr("class", "graph")
  .attr("width", width)
  .attr("height", height);

// Create the group element to hold element
let g = svg
  .append("g")
  .attr("transform", "translate(" + padding + "," + padding + ")");

// Create the color scale
let colorScale = d3
  .scaleThreshold()
  //Create an array of numeric values ranging from 2.6 to 75.1, with 4 equally spaced values in between
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 6))
  .range(d3.schemeGreens[7]);

// Create tooltip
let tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("width", "140px")
  .style("opacity", 0);

let legendValues = ["<15%", "15%-28%", "28%-40%", "40%-53%", "53%-65%", ">65%"];
let legendColors = [
  "#c7e9c0",
  "#a1d99b",
  "#74c476",
  "#50ac5d",
  "#408c46",
  "#275b32",
];

let legend = svg
  .append("g")
  .attr("id", "legend")
  // .attr("transform", "translate(" + padding + "," + (height - padding - 10) + ")");
  .attr("transform", "translate(400,40)");

legend
  .selectAll("rect")
  .data(legendColors)
  .enter()
  .append("rect")
  .attr("x", (d, i) => i * 80)
  .attr("y", 0)
  .attr("width", 80)
  .attr("height", 10)
  .attr("fill", (d) => d);

legend
  .selectAll("text")
  .data(legendValues)
  .enter()
  .append("text")
  .attr("class", "labelText")
  .attr("x", (d, i) => i * 80 + 40)
  .attr("y", 28)
  .attr("text-anchor", "middle")
  .text((d) => d);

d3.json(countyUrl)
  .then((countyData) => {
    let geojsonCounties = topojson.feature(
      countyData,
      countyData.objects.counties
    );

    d3.json(educationUrl)
      .then((educationData) => {
        g.selectAll("path")
          .data(geojsonCounties.features)
          .enter()
          .append("path")
          .attr("class", "county")
          .attr("d", path)
          .attr("data-fips", (d) => {
            return d.id;
          })
          .attr("data-education", (d) => {
            const county = educationData.find((c) => {
              return c.fips === d.id;
            });
            if (county) {
              return county.bachelorsOrHigher;
            } else {
              console.log("could find data for: ", d.id);
              return 0;
            }
          })

          .attr("fill", (d) => {
            const county = educationData.find((c) => {
              return c.fips === d.id;
            });
            if (county) {
              return colorScale(county.bachelorsOrHigher);
            } else {
              return colorScale(0);
            }
          })
          .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
              .attr("stroke", "white")
              .attr("stroke-width", 2);
            tooltip
              .transition()
              .duration(100)
              .style("opacity", 0.9)
              .attr("data-education", () => {
                const county = educationData.find((c) => {
                  return c.fips === d.id;
                });
                if (county) {
                  return county.bachelorsOrHigher;
                } else {
                  return 0;
                }
              });
            tooltip
              .html(() => {
                const county = educationData.find((c) => {
                  return c.fips === d.id;
                });
                if (county) {
                  return (
                    county.area_name +
                    ", " +
                    county.state +
                    ": " +
                    "<br />" +
                    county.bachelorsOrHigher +
                    "%"
                  );
                } else {
                  return "Data not found";
                }
              })
              .style("left", event.pageX + -20 + "px")
              .style("top", event.pageY - 65 + "px");
          })
          .on("mouseout", () => {
            d3.select(event.currentTarget)
              .attr("stroke", null)
              .attr("stroke-width", null);
            tooltip.transition().duration(200).style("opacity", 0);
          });
      })
      .catch((error) => console.log(error));
  })
  .catch((error) => console.log(error));
