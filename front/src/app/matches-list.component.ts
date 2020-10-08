import {Component, EventEmitter, Output} from "@angular/core";
import {BackendService} from "./backend.service";

export interface Match {
  matchGuid: string,
  homeTeam: {
    guid: string,
    name: string
  },
  awayTeam: {
    guid: string,
    name: string
  },
  dateTime: number,
  sportsHall: string,
  result: string,
  enemyTeam: string,

  inPast: boolean,
  didWeWin?: boolean
}

@Component({
  selector: 'matches-list',
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.css']
})
export class MatchesListComponent {
  @Output() select: EventEmitter<string> = new EventEmitter<string>();

  matches: Match[];

  constructor(private backendService: BackendService) {
    backendService.getAllMatches().subscribe(data =>
      this.matches = data
        .map(match => {
          match.inPast = new Date(Date.now()) > new Date(match.dateTime);
          return match;
        })
        .sort((m1: Match, m2: Match) => {
          return m1.dateTime - m2.dateTime;
        }));
  }

  onClick(match: Match) {
    this.select.emit(match.matchGuid);
  }
}
