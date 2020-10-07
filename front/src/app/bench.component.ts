import {Component, Input} from "@angular/core";

@Component({
  selector: 'bench',
  templateUrl: './bench.component.html',
  styleUrls: ['./bench.component.css']
})
export class BenchComponent {
  @Input() players = [];
  @Input() isHome: boolean;
}
