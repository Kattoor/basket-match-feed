import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {PlayerOnFieldFilterPipe} from './player-on-field.filter';
import {BenchComponent} from "./bench.component";
import {CourtComponent} from "./court.component";
import {TeamComponent} from "./team.component";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatchesListComponent} from "./matches-list.component";
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faClock as farClock} from "@fortawesome/free-regular-svg-icons";
import {faCar, faClock as fasClock, faHome} from "@fortawesome/free-solid-svg-icons";
import {AppRoutingModule} from "./app-routing/app-routing.module";
import {MatchComponent} from "./match.component";
import {
  LoopingRhumbusesSpinnerModule,
  SpringSpinnerModule
} from "angular-epic-spinners";


@NgModule({
  declarations: [
    AppComponent,
    BenchComponent,
    CourtComponent,
    TeamComponent,
    MatchesListComponent,
    MatchComponent,
    PlayerOnFieldFilterPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    AppRoutingModule,
    LoopingRhumbusesSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(farClock, fasClock, faHome, faCar);
  }
}
