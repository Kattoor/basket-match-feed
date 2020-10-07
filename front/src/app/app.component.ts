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
  period: number;
  minute: number;
  homeTeamName: string;
  awayTeamName: string;
  homeGuid: string;
  awayGuid: string;
  playerInfoPaneVisible = false;

  previousMinute: number;
  homePlayersLast5 = [];
  awayPlayersLast5 = [];

  colorScheme = {
    domain: ['#27ae60', '#2980b9', '#e74c3c']
  };

  multi: any[];

  shortenName(name) {
    const nameSplit = name.split(' ');
    const firstName = nameSplit[0];
    const firstLetters = nameSplit.slice(1).map(namePart => namePart[0] + '.');
    return firstName + ' ' + firstLetters.join(' ');
  }

  constructor(private backendService: BackendService) {
    this.backendService.getData()
      .subscribe((data: any) => {
        const playerData = data.playerData;
        const records = data.records;
        const matchData = data.matchData;

        this.homePlayers = playerData.homePlayers.map(p => Object.assign(p, {displayName: this.shortenName(p.name)}, {
          points: 0,
          fault: 0,
          timePlayed: 0
        }));
        this.awayPlayers = playerData.awayPlayers.map(p => Object.assign(p, {displayName: this.shortenName(p.name)}, {
          points: 0,
          fault: 0,
          timePlayed: 0
        }));

        this.homeTeamName = matchData.home;
        this.awayTeamName = matchData.away;
        this.homeGuid = matchData.homeGuid;
        this.awayGuid = matchData.awayGuid;

        records.forEach(record => {
          if (record.type === 50) {
            const playersArray = this[record.homeOrAway + 'Players'];
            const player = playersArray.filter(p => p.name === record.playerName)[0];

            player.onField = record.inOrOut === 'in';

            if (record.inOrOut === 'in') {
              const last5PlayersArray = this[record.homeOrAway + 'PlayersLast5'];
              last5PlayersArray.push(player);
              if (last5PlayersArray.length > 5) {
                last5PlayersArray.shift();
              }
            }
          }

          if (record.type === 10) {
            this.score = record.score.home + ' - ' + record.score.away;

            const playersArray = this[record.homeOrAway + 'Players'];
            const player = playersArray.filter(p => p.name === record.playerName)[0];

            player.points += +record.pointsMade;
          }

          if (record.type === 40) {
            this.period = record.period;
          }

          if (record.type === 40 || record.type === 60) {
            if (record.period !== 1) {
              this.homePlayersLast5.forEach(p => p.timePlayed++);
              this.awayPlayersLast5.forEach(p => p.timePlayed++);
            }
          }

          if (record.type === 30) {
            const playersArray = this[record.homeOrAway + 'Players'];
            const player = playersArray.filter(p => p.number === record.playerNumber)[0];

            player.fault++;
          }

          if (this.minute !== record.minute && record.period !== 99) {
            this.previousMinute = this.minute;
            this.minute = record.minute;

            const deltaTime = this.minute - this.previousMinute;
            if (deltaTime > 0) {
              let awardableHomePlayers = this.homePlayers.filter(p => p.onField);
              if (awardableHomePlayers.length < 5) {
                awardableHomePlayers = awardableHomePlayers.concat(this.homePlayersLast5.slice((5 - awardableHomePlayers.length) * -1));
              }

              let awardableAwayPlayers = this.awayPlayers.filter(p => p.onField);
              if (awardableAwayPlayers.length < 5) {
                awardableAwayPlayers = awardableAwayPlayers.concat(this.awayPlayersLast5.slice((5 - awardableAwayPlayers.length) * -1));
              }

              awardableHomePlayers.forEach(p => p.timePlayed += deltaTime);
              awardableAwayPlayers.forEach(p => p.timePlayed += deltaTime);
            }
          }

          this.calculateGraph();
        });
      });
  }

  calculateGraph() {
    this.multi = this.homePlayers
      .map(p => ({
        name: p.name.split(' ')[0],
        series: [
          {
            name: 'Score',
            value: p.points
          },
          {
            name: 'Time Played',
            value: p.timePlayed
          },
          {
            name: 'Faults',
            value: p.fault
          }
        ]
      }));
    this.multi = this.multi.sort((p1, p2) => {
      return p1.series[0].value - p2.series[0].value;
    });
  }
}
