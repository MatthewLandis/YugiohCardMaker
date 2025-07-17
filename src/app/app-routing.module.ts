import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardMakerComponent } from './cardmaker/cardmaker.component';



const routes: Routes = [
  { path: '', redirectTo: '/CardMaker', pathMatch: 'full' },
  { path: 'CardMaker', component: CardMakerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
