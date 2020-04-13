import { Injectable } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore'; 
import { AngularFireAuth } from '@angular/fire/auth';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private firestore:AngularFirestore, private authentication:AngularFireAuth, private route:Router) {


   }

  userRegister(data){
    const {email, password} = data;
    this.authentication.createUserWithEmailAndPassword(email,password).then(
      result => {
        console.log('se ha creado ', result);
        const newUser = {
          email:email,
          password:password,
          status:2,
          misTokens:100
        }
        this.firestore.collection('users').add(newUser);
        this.route.navigate(['/main']);
      }
    ).catch(error => {
      var mensajeError;
      if(error.code == 'auth/email-already-in-use'){
        mensajeError = 'Este email ya esta registrado'
      }else if(error.code == 'auth/invalid-email'){
        mensajeError = 'El Email no es valido'
      }
      else if(error.code == "auth/weak-password"){
        mensajeError = 'La contraseña debe tener al menos 6 digitos '
      }
      Swal.fire({
        title: "Disculpe",
        text: mensajeError,
        icon: 'warning',
        confirmButtonText: 'continuar'
      })
    })
  }



}
