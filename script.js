async function getData(url) {
    const response = await fetch(url)
    return response.json();
}

const
    sourceEdu = await getData('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'),
    sourceCounty = await getData('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json');

let dataCounty = topojson.feature(sourceCounty, sourceCounty.objects.counties).features;

const colorRange = [
    {
        maxRange: 8,
        fill: '#A9D6FB'
    },
    {
        maxRange: 16,
        fill: '#91C2F7'
    },
    {
        maxRange: 24,
        fill: '#7AADF3'
    },
    {
        maxRange: 32,
        fill: '#6495ED'
    },
    {
        maxRange: 40,
        fill: '#5A8CDB'
    },
    {
        maxRange: 48,
        fill: '#5083C8'
    },
    {
        maxRange: 56,
        fill: '#4778B5'
    },
    {
        maxRange: 64,
        fill: '#3E6EA2'
    },
    {
        maxRange: 72,
        fill: '#35638E'
    },
    {
        maxRange: 80,
        fill: '#2C577A'
    }

]; /*colorRange[i].maxRange || colorRange[i].fill*/

let tooltip = d3.select('.tooltip')
    .style('visibility', 'hidden')
    ;

let tooltipText = (data) => {
    let match = sourceEdu.find(value => value.fips == data.id);
    return `${match['area_name']}, ${match.state}: ${match.bachelorsOrHigher}%`
}
const canvas = d3.select('.canvas')

canvas.selectAll('path')
    .data(dataCounty)
    .enter()
    .append('path')
    .attr('d', d3.geoPath())
    .attr('class', 'county')
    .attr('data-fips', d => {
        let match = sourceEdu.find(value => value.fips == d.id);
        return match.fips
    })
    .attr('data-education', d => {
        let match = sourceEdu.find(value => value.fips == d.id);
        return match.bachelorsOrHigher;
    })
    .attr('fill', (d) => {
        let match = sourceEdu.find(value => value.fips == d.id);
        return colorRange.find(range => range.maxRange > match.bachelorsOrHigher).fill;
    })
    .on('mousemove', function (d, info) {
        tooltip.attr('data-education', (data = info) => {
            let match = sourceEdu.find(value => value.fips == data.id);
            return match.bachelorsOrHigher;
        });
        tooltip.transition()
            .duration(200)
            .style('visibility', 'visible')
        tooltip.html(`${tooltipText(info)}`)
            .style('top', `${d.pageY}px`)
            .style('left', `${d.pageX +20}px`)
    })
    .on('mouseout', function (d) {
        tooltip.transition()
            .duration(500)
            .style('visibility', 'hidden')
    })
    ;

//Legend
const rectWidth = 30, rectHeight = 15;
const legendScale = d3.scaleLinear()
    .domain([0, d3.max(colorRange, d => d.maxRange)])
    .range([0, rectWidth * 10])
    ;
const legendAxis = d3.axisBottom(legendScale).tickValues([0, ...colorRange.map(value => value.maxRange)]);

canvas.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(600 , 10)`)
    .call(g => g.selectAll('rect')
        .data(colorRange)
        .enter()
        .append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('x', (d, i) => i * rectWidth)
        .attr('y', 0)
        .attr('fill', d => d.fill))
    .call(g => g.append('g')
        .attr('id', 'legend-axis')
        .attr('transform', `translate(0, ${rectHeight})`)
        .call(legendAxis))
    ;

canvas.selectAll('#legend-axis .tick line').attr('y2', -rectHeight);
