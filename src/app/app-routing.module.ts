import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginAnimationComponent } from './startscreen/login-animation/login-animation.component';

const routes: Routes = [
  { path: '', component: LoginAnimationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
