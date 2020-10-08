import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Match} from "./matches-list.component";

@Injectable({providedIn: 'root'})
export class BackendService {
  constructor(private http: HttpClient) {

  }

  getAllMatches() {
    return this.http.get<Match[]>('http://localhost:8080/api/all-matches');
  }

  getMatchData(matchGuid: string) {
    return this.http.get('http://localhost:8080/api/match?guid=' + matchGuid);
  }
}
