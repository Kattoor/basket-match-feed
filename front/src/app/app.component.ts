import {Component} from '@angular/core';
import {BackendService} from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'basket-match-feed';
  homePlayers = [];
  awayPlayers = [];
  score: string;
  period: string;
  minute: string;

  constructor(private backendService: BackendService) {
    this.backendService.getData()
      .subscribe((data: any) => {
        const playerData = data.playerData;
        const records = data.records;

        this.homePlayers = playerData.homePlayers;
        this.awayPlayers = playerData.awayPlayers;

        records.forEach(record => {
          if (record.type === 50) {
            const playersArray = this[record.homeOrAway + 'Players'];
            const player = playersArray.filter(p => p.name === record.playerName)[0];

            player.onField = record.inOrOut === 'in';
          }

          if (record.type === 10) {
            this.score = record.score.home + ' - ' + record.score.away;
          }

          if (record.type === 40) {
            this.period = record.period;
          }

          if (record.type === 30) {
            const playersArray = this[record.homeOrAway + 'Players'];
            const player = playersArray.filter(p => p.number === record.playerNumber)[0];

            if (player.fault === undefined) {
              player.fault = 0;
            }

            player.fault++;
          }

          this.minute = record.minute;
        });
      });
  }
}
