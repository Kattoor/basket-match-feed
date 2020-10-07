import {Component, Input} from "@angular/core";

@Component({
  selector: 'team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent {
  @Input() players = [];
  @Input() isHome: boolean;
  @Input() teamGuid: string;
  @Input() teamName: string;
}
