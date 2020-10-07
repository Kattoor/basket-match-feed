import {Component, Input} from "@angular/core";

@Component({
  selector: 'court',
  templateUrl: './court.component.html',
  styleUrls: ['./court.component.css']
})
export class CourtComponent {
  @Input() players = [];
  @Input() isHome: boolean;
}
