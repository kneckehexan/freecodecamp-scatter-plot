document.addEventListener('DOMContentLoaded', function() {
  const req = new XMLHttpRequest();
  req.open('GET', 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', true);
  req.send();
  req.onload = () => {
    const json = JSON.parse(req.responseText);
    var dataset = json.sort((a, b) => a.Time.localeCompare(b.Time));
    createChart(dataset);
  }

  function createChart(dataset){
    const w = 1000;
    const h = 600;
    const padding = 60;
    const circleRadius = 5;
    const dope = '#C0504D';
    const noDope = '#388D38';

    var color = [dope, noDope];

    d3.select('#title').text('Doping in Professional Bicycle Racing');

    var tooltip = d3.select('.chartContainer')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    dataset.forEach((d) => {
      var parsedTime = d.Time.split(':');
      d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    const xScale = d3.scaleLinear()
      .domain([d3.min(dataset, (d) => d.Year - 1), d3.max(dataset, (d) => d.Year + 1)])
      .range([padding, w - padding]);

    const yScale = d3.scaleTime()
      .domain(d3.extent(dataset, (d) => d.Time).reverse())
      .range([h-padding, padding]);

    const timeFormat = d3.timeFormat('%M:%S');
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
    var addZero = (time) => {
      return (time < 10 ? '0' + time : time);
    }

    const svg = d3.select('.chartContainer')
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    svg.selectAll('circle')
      .data(dataset)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.Year))
      .attr('cy', (d) => yScale(d.Time))
      .attr('r', circleRadius)
      .attr('stroke', 'black')
      .attr('stroke-width', '1')
      .attr('data-xvalue', (d) => d.Year)
      .attr('data-yvalue', (d) => new Date(d.Time))
      .attr('fill', (d) => d.Doping !== "" ? dope : noDope)
      .attr('class', 'dot')
      .on('mouseover', (d, i) => {
        tooltip
          .transition()
          .duration(0)
          .style('left', d.pageX + 10 + 'px')
          .style('top', d.pageY - 25 + 'px')
          .style('opacity', 0.9);
        tooltip
          .html(
            'Name: ' + i.Name + '<br>'
            + 'Time: ' + addZero(i.Time.getMinutes()) + ':' + addZero(i.Time.getSeconds()) + '<br>'
            + 'Year: ' + i.Year + '<br>'
            + 'Nationality: ' + i.Nationality + 
            (i.Doping !== "" ? '<br>Comment: ' + i.Doping : "")
            )
          .attr('data-year', i.Year);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      });
    
      svg.append('text')
        .attr('x', w/2 + padding/2 + 'px')
        .attr('y', h-padding/2 + 'px')
        .text('Year');

      svg.append('text')
        .attr('transform', 'translate(-280, 290)rotate(-90)')
        .attr('x', padding / 2 - 10)
        .attr('y', h/2)
        .text('Time');

      svg.append('g')
        .attr('transform', 'translate(0,' + (h - padding) + ')')
        .attr('id', 'x-axis')
        .call(xAxis)
        .attr('class', 'tick');

      svg.append('g')
        .attr('transform', 'translate(' + padding + ', 0)')
        .attr('id', 'y-axis')
        .call(yAxis)
        .attr('class', 'tick');
      
      var legendContainer = svg.append('g').attr('id', 'legend');
      var legend = legendContainer.selectAll('#legend')
        .data(color)
        .enter()
        .append('g')
        .attr('transform', (d,i) => 'translate(0, ' + (h/2 - i*20) + ')');
      
      legend.append('rect')
        .attr('x', w - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', (c) => c);
      
      legend.append('text')
        .attr('x', w-24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text((c) => c !== noDope ? 'Riders with doping allegations' : 'No doping allegations');
  }
});