import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Match} from "./matches-list.component";

@Injectable({providedIn: 'root'})
export class BackendService {
  constructor(private http: HttpClient) {

  }

  teamGuid: string = 'BVBL1047HSE  1';

  getAllMatches() {
    return this.http.get<Match[]>('http://catthoor.com:8081/api/all-matches?teamGuid=' + this.teamGuid);
  }

  getMatchData(matchGuid: string) {
    return this.http.get('http://catthoor.com:8081/api/match?teamGuid=' + this.teamGuid + '&matchGuid=' + matchGuid);
  }

  getMatchMetaData(matchGuid: string) {
    return this.http.get('http://catthoor.com:8081/api/match-metadata?guid=' + matchGuid);
  }
}
