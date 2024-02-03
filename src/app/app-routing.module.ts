import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainscreenComponent } from './mainscreen/mainscreen.component';
import { StartscreenComponent } from './startscreen/startscreen.component';

const routes: Routes = [
  { path: '', component: StartscreenComponent },
  { path: 'main/:id', component: MainscreenComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
