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
      Swal.fire({
        title: "Disculpe",
        text: 'El email o la contraseña no son validos para el registro',
        icon: 'warning',
        confirmButtonText: 'continuar'
      })
    })
  }



}
