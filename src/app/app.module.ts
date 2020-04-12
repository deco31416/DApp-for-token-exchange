//dependencias Necesarias
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {AngularFireModule} from '@angular/fire';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

//proteccion por authentication

import {AuthGuard} from './authentication/auth.guard';

//lista de componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { ShopComponent } from './components/shop/shop.component';
import { RegisterComponent } from './components/register/register.component';
import { Routes, RouterModule } from '@angular/router';
import { MainService } from './services/main.service';
import { ShopService } from './services/shop.service';
import {LoginService} from './services/login.service';
import {RegisterService} from './services/register.service';
import { environment } from 'src/environments/environment';

//generando rutas


const rutas: Routes = [
  { path: '', component: LoginComponent},
  { path: 'main', component: MainComponent, canActivate:[AuthGuard]},
  { path: 'register', component: RegisterComponent},
  { path: 'shop', component: ShopComponent, canActivate:[AuthGuard]},
  { path: '**', component: LoginComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    ShopComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(rutas),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule
  ],
  providers: [LoginService,RegisterService,MainService,ShopService,AngularFireAuth],
  bootstrap: [
    AppComponent]
})
export class AppModule { }
