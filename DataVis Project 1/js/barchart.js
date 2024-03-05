class Barchart {

   /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */

    constructor(_config, _data) {

      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 1000,
        containerHeight: _config.containerHeight || 640,
        margin: {top: 40, right: 100, bottom: 70, left: 75},
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.initVis();
    }
   
    
    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


        vis.colorScale = d3.scaleOrdinal()
        .range(['#02ed35', '#022aed', '#ed021e'])
        .domain(['Rural','Suburban','Small City']);

        vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
        
        vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)

        vis.xValue = d => d.display_name;
        vis.xScale = d3.scaleBand()
            .domain(vis.data.map(vis.xValue))
            .range([0, vis.width]);

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.xAxisGroup = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`) 
          .call(vis.xAxis);

          vis.yScale = d3.scaleLinear()
          .range([vis.height,0]); 

          vis.yAxis = d3.axisLeft(vis.yScale);

          vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')

      vis.svg.append('text')
        .attr('class', 'axis-title y-axis-title')
        .attr('text-anchor', 'end')
        .attr('y', 0)
        .attr('x', -200)
        .attr('dy', '.75em')
        .attr('transform', 'rotate(-90)')
        
    }
  
    updateVis(attr, attributeText) {
        let vis = this;

        vis.colorValue = d => d.urban_rural_status; 
        vis.yValue = (d,attribute) => d[attribute];
      
        vis.yScale.domain([0, d3.max(vis.data, (d) => vis.yValue(d, attr))]);

        vis.yAxisGroup.call(vis.yAxis);
        

        vis.svg.select('.y-axis-title')
        .text(attributeText);

        vis.renderVis(attr, attributeText);
    }   
    
    renderVis(attr, attributeText) {
      let vis = this;
      const filteredData = vis.data.filter(d => d[attr] != -1);
      let bars = vis.chart.selectAll('.rect')
            .data(filteredData, vis.xValue)
          .join('rect');

      bars
        .attr('class', 'rect')
        .attr('x', d => vis.xScale(vis.xValue(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('height', d => {
          const value = vis.height - vis.yScale(vis.yValue(d, attr))
          return value;
      })
        .attr('y', d => vis.yScale(vis.yValue(d, attr)))
        .attr('fill', d => vis.colorScale(vis.colorValue(d)))


      bars
      .on('mouseover', (event,d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title">${d.display_name}</div>
            <ul>
              <li>${attributeText} : ${d[attr]}</li>
              <li> Urban/Rural Status : ${d.urban_rural_status}</li>
            </ul>
          `);
          
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });


        
      }  


}
  