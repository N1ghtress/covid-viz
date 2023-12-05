const width = 700, height = 500

let svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Group
let g = svg.append("g")

let tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'hidden tooltip')

const projection = d3
    .geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2800);

let path = d3
    .geoPath()
    .projection(projection);

const color = d3
    .scaleQuantize()
    .range(["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"])

d3.csv("covid.csv").then((data) => {
    let cleanData = data.filter((d) => d.sexe == 0)
    color.domain([
        d3.min(data, (d) => d.hosp),
        d3.max(data, (d) => d.hosp)
    ]);

    d3.json("departements-version-simplifiee.geojson").then((json) => {
        for (let i = 0; i < json.features.length; i++) {
            let codeDep = json.features[i].properties.code
            let depData = cleanData.filter((row) => row.dep == codeDep).map((e) => e.hosp)
            json.features[i].properties.values = depData
        }
        const drawMap = (day) => {
            map = svg.selectAll("path").data(json.features);

            map
                .join("path")
                .attr("d", path)
                .style("fill", (d) => {
                    let value = d.properties.values[day]
                    if (value) {
                        return color(value);
                    } else {
                        return "#ccc"
                    }
                })
                .on('mousemove', (e, d) => {
                    let mousePosition = [e.x, e.y]
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mousePosition[0] + 15) + 'px; top:' + (mousePosition[1] - 35) + 'px;')
                        .html(d.properties.nom + ' ' + d.properties.values[day])
                })
            d3.select('#day').html("Jour: " + day)
        }
        const slider = document.getElementById('slider')
        slider.addEventListener('change', (e) => {
            console.log(`Loading day ${e.target.value}`)
            d3.select("#slider").on("input", () => drawMap(e.target.value))
        })
        drawMap(0)
    })
})

