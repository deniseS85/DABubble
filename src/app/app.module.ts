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
import { MainscreenComponent } from './mainscreen/mainscreen.component';
import { ThreadComponent } from './mainscreen/thread/thread.component';
import { WorkspaceComponent } from './mainscreen/workspace/workspace.component';
import { ChannelChatComponent } from './mainscreen/channel-chat/channel-chat.component';
import { LoginComponent } from './startscreen/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { SignupComponent } from './startscreen/signup/signup.component';
import { ResetPasswordComponent } from './startscreen/reset-password/reset-password.component';
import { SelectAvatarComponent } from './startscreen/select-avatar/select-avatar.component';
import { ImprintComponent } from './startscreen/imprint/imprint.component';
import { DataProtectionComponent } from './startscreen/data-protection/data-protection.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { DatePipe } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EditAnswerComponent } from './mainscreen/thread/edit-answer/edit-answer.component';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EmojiPickerComponent } from './mainscreen/emoji-picker/emoji-picker.component';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { ThreadsSendMessageComponent } from './mainscreen/thread/threads-send-message/threads-send-message.component';
import { ThreadsHeaderComponent } from './mainscreen/thread/threads-header/threads-header.component';
import { ThreadQuestionComponent } from './mainscreen/thread/thread-question/thread-question.component';
import { ChatContainerComponent } from './mainscreen/chat-container/chat-container.component';
import { EditChannelChatComponent } from './mainscreen/channel-chat/edit-channel-chat/edit-channel-chat.component';
import { UserProfileCardComponent } from './mainscreen/user-profile-card/user-profile-card.component';
import { NewMessageComponent } from './mainscreen/new-message/new-message.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';


registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [
    AppComponent,
    StartscreenComponent,
    LoginAnimationComponent,
    LoginComponent,
    MainscreenComponent,
    ThreadComponent,
    WorkspaceComponent,
    ChannelChatComponent,
    SignupComponent,
    ResetPasswordComponent,
    SelectAvatarComponent,
    ImprintComponent,
    DataProtectionComponent,
    EditAnswerComponent,
    EmojiPickerComponent,
    ThreadsSendMessageComponent,
    ThreadsHeaderComponent,
    ThreadQuestionComponent,
    ChatContainerComponent,
    EditChannelChatComponent,
    UserProfileCardComponent,
    NewMessageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatRadioModule,
    PickerComponent,
    MatSnackBarModule,
    MatProgressBarModule,
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyAmwp319uKefb1UBdYYCILbjLuE2F7n0nI",
    authDomain: "da-bubble2.firebaseapp.com",
    projectId: "da-bubble2",
    storageBucket: "da-bubble2.appspot.com",
    messagingSenderId: "870520891241",
    appId: "1:870520891241:web:ee6a2cce7db5cef1f87ff8"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
  ],
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'de' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
