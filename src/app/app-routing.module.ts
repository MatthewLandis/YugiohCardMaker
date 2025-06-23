import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardMakerComponent } from './cardmaker/cardmaker.component';
import { AboutComponent } from './about/about.component';



const routes: Routes = [
  { path: '', component: AboutComponent },
  { path: 'About', component: AboutComponent },
  { path: 'CardMaker', component: CardMakerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
