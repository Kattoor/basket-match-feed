type SvgInHtml = HTMLElement & SVGElement;

import {Component, Input} from '@angular/core';

@Component({
  selector: 'svg-chart',
  templateUrl: './svg-chart.component.html',
  styleUrls: ['./svg-chart.component.css']
})
export class SvgChartComponent {

  dataToDraw: any[];

  private _data: any[];

  svgHeight = 0;
  barWidth = 0;

  @Input() set data(value: any[]) {
    this._data = value;
    this.draw();
  }

  get data(): any[] {
    return this._data;
  }

  @Input() colors: any[];

  svg: any;

  resize() {
    this.draw();
  }

  ngOnInit() {
    this.svg = <SvgInHtml>document.getElementById("svg");
    this.resize();
    window.addEventListener('resize', () => this.resize(), false);
  }

  draw() {
    if (!this._data)
      return;

    const amountOfPlayers = this.data.length;
    const width = this.svg.width.baseVal.value;
    this.svgHeight = this.svg.height.baseVal.value;

    const groupPadding = 10;
    const barPadding = 2;
    const chartTopPadding = 20;
    const chartBottomMargin = 25;
    const chartHorizontalMargin = 50;

    const playerWidth = (width - chartHorizontalMargin * 2) / amountOfPlayers;

    const amountOfBarsPerPlayer = 3;

    const barsSectionWidth = playerWidth - groupPadding * 2;

    const barWidth = (barsSectionWidth - (amountOfBarsPerPlayer * barPadding * 2)) / amountOfBarsPerPlayer;
    this.barWidth = barWidth;

    const numbers: number[] = [].concat(...this.data.map(record => [record.score, record.timePlaying, record.faults]));
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const yScale = (this.svgHeight - chartTopPadding - chartBottomMargin) / (max - min);

    this.dataToDraw = this._data.map((record, i) =>
      Object.assign({}, record, {
        x: chartHorizontalMargin + i * playerWidth,
        width: playerWidth,
        bars: {
          score: {
            width: barWidth,
            y: this.svgHeight - record.score * yScale - chartBottomMargin,
            height: record.score * yScale,
            x: chartHorizontalMargin + i * playerWidth + groupPadding + barPadding,
            value: record.score
          },
          timePlaying: {
            width: barWidth,
            y: this.svgHeight - record.timePlaying * yScale - chartBottomMargin,
            height: record.timePlaying * yScale,
            x: chartHorizontalMargin + i * playerWidth + groupPadding + barPadding + barWidth + barPadding + barPadding,
            value: record.timePlaying
          },
          faults: {
            width: barWidth,
            y: this.svgHeight - record.faults * yScale - chartBottomMargin,
            height: record.faults * yScale,
            x: chartHorizontalMargin + i * playerWidth + groupPadding + barPadding + barWidth + barPadding + barPadding + barWidth + barPadding + barPadding,
            value: record.faults
          }
        }
      }));
  }

  showToolTip(bar, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = text;
    tooltip.style.display = 'block';

    let tooltipLeft = (bar.x - ((tooltip.offsetWidth - this.barWidth) / 2));
    const tooltipTop = bar.y - tooltip.offsetHeight - 10;

    tooltip.style.left = tooltipLeft + 'px';
    tooltip.style.top = tooltipTop + 'px';
  }

  hideToolTip() {
    const tooltip = document.getElementById("tooltip");
    tooltip.style.left = 0 + 'px';
    tooltip.style.top = 0 + 'px';
    tooltip.style.display = 'none';
  }
}
