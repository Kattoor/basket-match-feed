import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Match} from "./matches-list.component";

@Injectable({providedIn: 'root'})
export class BackendService {
  constructor(private http: HttpClient) {

  }

  getAllMatches() {
    return this.http.get<Match[]>('http://catthoor.com:8081/api/all-matches');
  }

  getMatchData(matchGuid: string) {
    return this.http.get('http://catthoor.com:8081/api/match?guid=' + matchGuid);
  }

  getMatchMetaData(matchGuid: string) {
    return this.http.get('http://catthoor.com:8081/api/match-metadata?guid=' + matchGuid);
  }
}
