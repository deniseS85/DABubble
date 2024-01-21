import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainscreenComponent } from './mainscreen/mainscreen.component';
import { StartscreenComponent } from './startscreen/startscreen.component';
import { TestQueryComponent } from './testQueryData/test-query/test-query.component';

const routes: Routes = [
  { path: '', component: StartscreenComponent },
  { path: 'main', component: MainscreenComponent},
  { path: 'test', component: TestQueryComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
