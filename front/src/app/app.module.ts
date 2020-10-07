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


@NgModule({
  declarations: [
    AppComponent,
    BenchComponent,
    CourtComponent,
    TeamComponent,
    PlayerOnFieldFilterPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
