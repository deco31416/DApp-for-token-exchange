import { Injectable } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireAuthGuard} from'@angular/fire/auth-guard'

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private guard:AngularFireAuthGuard,private auth:AngularFireAuth) {

   }

   logUser(email:string,password:string){
    return new Promise((resolve,reject) => {
      this.auth.signInWithEmailAndPassword(email,password).
      then(resultado => {
        resolve(resultado);
      },
      error => {
        reject(error);
      }
      );
    });
   }
   
   authState(){
     return this.auth.authState;
   }



}
