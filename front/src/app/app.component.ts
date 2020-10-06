import {Component} from '@angular/core';
import {BackendService} from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'basket-match-feed';
  homePlayersOnField = [];
  awayPlayersOnField = [];
  currentScore = [];

  constructor(private backendService: BackendService) {
    this.backendService.getData()
      .subscribe((data: any[]) => {
        data.forEach(record => {
          if (record.type === 50) {
            const playersArray = this[record.homeOrAway + 'PlayersOnField'];
            if (record.inOrOut === 'in') {
              playersArray.push(record.playerName);
              console.log(this.homePlayersOnField);
            } else {
              playersArray.splice(playersArray.findIndex(player => player === record.playerName), 1);
            }
          }
        });
      });
  }
}
