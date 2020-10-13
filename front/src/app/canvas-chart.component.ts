import {Component, Input} from '@angular/core';

@Component({
  selector: 'canvas-chart',
  templateUrl: './canvas-chart.component.html',
  styleUrls: ['./canvas-chart.component.css']
})
export class CanvasChartComponent {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  private _data: any[];

  @Input() set data(value: any[]) {
    this._data = value;
    this.draw();
  }

  get data(): any[] {
    return this._data;
  }

  @Input() colors: any[];

  resizeCanvas() {
    const windowWidth = document.body.clientWidth;
    this.canvas.width = windowWidth / 100 * 80;
    this.canvas.height = 400;
    this.canvas.style.width = this.canvas.width + 'px';
    this.canvas.style.height = '400px';
    this.draw();
  }

  ngOnInit() {
    this.canvas = <HTMLCanvasElement>document.getElementById("canv");
    this.ctx = this.canvas.getContext("2d");

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas(), false);
  }

  draw() {
    if (!this._data)
      return;

    const amountOfPlayers = this.data.length;
    const width = this.canvas.width;
    const groupPadding = 10;
    const barPadding = 2;
    const chartTopPadding = 20;
    const chartBottomMargin = 25;

    const playerWidth = width / amountOfPlayers;

    const amountOfBarsPerPlayer = 3;

    const barsSectionWidth = playerWidth - groupPadding * 2;

    const barWidth = (barsSectionWidth - (amountOfBarsPerPlayer * barPadding * 2)) / amountOfBarsPerPlayer;

    const numbers: number[] = [].concat(...this.data.map(record => [record.score, record.timePlaying, record.faults]));
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const yScale = (this.canvas.height - chartTopPadding - chartBottomMargin) / (max - min);

    for (let i = 0; i < amountOfPlayers; i++) {

      if (i % 2 === 0) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(i * playerWidth, 0, playerWidth, this.canvas.height - chartBottomMargin);
      }

      this.ctx.fillStyle = this.colors['domain'][0];
      let scaledValue = this.data[i].score * yScale;
      this.ctx.fillRect(
        i * playerWidth + groupPadding + barPadding,
        this.canvas.height - scaledValue - chartBottomMargin,
        barWidth,
        scaledValue);

      this.ctx.fillStyle = this.colors['domain'][1];
      scaledValue = this.data[i].timePlaying * yScale;
      this.ctx.fillRect(
        i * playerWidth + groupPadding + barPadding + barWidth + barPadding + barPadding,
        this.canvas.height - scaledValue - chartBottomMargin,
        barWidth,
        scaledValue);

      this.ctx.fillStyle = this.colors['domain'][2];
      scaledValue = this.data[i].faults * yScale;
      this.ctx.fillRect(
        i * playerWidth + groupPadding + barPadding + barWidth + barPadding + barPadding + barWidth + barPadding + barPadding,
        this.canvas.height - scaledValue - chartBottomMargin,
        barWidth,
        scaledValue);

      this.ctx.fillStyle = '#000000';
      this.ctx.font = '12px sans-serif';
      const text = this.data[i].name;
      this.ctx.fillText(text, i * playerWidth + playerWidth / 2 - this.ctx.measureText(text).width / 2, this.canvas.height);
    }

    const yScalePercentage = this.canvas.height - chartTopPadding - chartBottomMargin;
    for (let i = 0; i < amountOfPlayers; i++) {
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      this.ctx.strokeStyle = '#000000';
      const rate = this._data[i].score / this._data[i].timePlaying;

      this.ctx.fillRect(i * playerWidth, this.canvas.height - chartBottomMargin - rate * yScalePercentage, playerWidth, rate * yScalePercentage);
/*      if (i < amountOfPlayers - 1) {
        this.ctx.beginPath();
        const fromY = this._data[i].score / this._data[i].timePlaying * 30;
        const toY = this._data[i + 1].score / this._data[i + 1].timePlaying * 30;
        this.ctx.moveTo(i * playerWidth + playerWidth / 2, this.canvas.height - chartBottomMargin - fromY * yScale);
        this.ctx.lineTo((i + 1) * playerWidth + playerWidth / 2, this.canvas.height - chartBottomMargin - toY * yScale);
        this.ctx.stroke();
      }*/
    }
  }
}
