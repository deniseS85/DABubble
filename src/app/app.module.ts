import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StartscreenComponent } from './startscreen/startscreen.component';
import { LoginAnimationComponent } from './startscreen/login-animation/login-animation.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { LoginComponent } from './startscreen/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    StartscreenComponent,
    LoginAnimationComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp({"projectId":"dabubble-69322","appId":"1:486842154610:web:0631e3885b73bc4e4acceb","storageBucket":"dabubble-69322.appspot.com","apiKey":"AIzaSyC2opRUMbcOUpjD2QPCifl1muUI_7Wf-cw","authDomain":"dabubble-69322.firebaseapp.com","messagingSenderId":"486842154610"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
