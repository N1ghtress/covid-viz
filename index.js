const width = 700, height = 500

let svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Group
let g = svg.append("g")

let tooltip = d3.select('body')
    .append('div')
    .attr('class', 'hidden tooltip')

const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2800);

let path = d3.geoPath().projection(projection);

const color = d3.scaleQuantize()
    .range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15'])

d3.csv("covid.csv").then((data) => {
    let cleanData = data.filter((d) => d.sexe == 0)
    color.domain([
        d3.min(data, (d) => d.hosp),
        d3.max(data, (d) => d.hosp)
    ]);

    d3.json("departements-version-simplifiee.geojson").then((json) => {
        let dates = cleanData.reduce((acc, cur) => {
            if (!acc.includes(cur.jour)) acc.push(cur.jour)
            return acc
        }, [])
        for (let i = 0; i < json.features.length; i++) {
            let codeDep = json.features[i].properties.code
            let depData = cleanData.filter((row) => row.dep == codeDep).map((e) => e.hosp)
            json.features[i].properties.values = depData
        }
        const drawMap = (day) => {
            map = svg.selectAll("path").data(json.features);
            map.join("path")
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
                .on('mouseout', () => {
                    tooltip.classed('hidden', true)
                })
            date = new Date(dates[day]).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            d3.select('#day').html(date)
        }
        const slider = document.getElementById('slider')
        slider.addEventListener('input', (e) => drawMap(e.target.value))
        drawMap(slider.value)
    })
})
