import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginAnimationComponent } from './startscreen/login-animation/login-animation.component';
import { MainscreenComponent } from './mainscreen/mainscreen.component';

const routes: Routes = [
  { path: '', component: LoginAnimationComponent },
  { path: 'main', component: MainscreenComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
