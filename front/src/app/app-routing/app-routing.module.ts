import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MatchesListComponent} from "../matches-list.component";
import {MatchComponent} from "../match.component";

const routes: Routes = [
  {
    path: '',
    component: MatchesListComponent
  },
  {
    path: 'match/:id',
    component: MatchComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
