import { Component, OnInit, Input } from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoginService} from '../../services/login.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent implements OnInit {

  email:string="";
  password:string="";
  isLoged:boolean=false;
  constructor(private service:LoginService,private router:Router) { }

  ngOnInit() {
    this.service.authState().subscribe(resultado =>{
      if(resultado){
        this.router.navigate(['/main']);
      }
    })
  }

  loginUser(form:NgForm){
    this.service.logUser(this.email,this.password).then(
      resultado => {
        if(resultado){
          this.resetForm(form);
          this.router.navigate(['/main']);
        }
        
      },
      error =>{
        Swal.fire({
          title: "Vaya Vaya",
          text: 'Verifica los datos ingresados',
          icon: 'question',
          confirmButtonText: 'Intentar otra vez'
        }) 
      }
    )

  }

  redirect(){
    this.router.navigate(['/register']);
  }
  resetForm(form:NgForm){
    form.resetForm();
  }

  
}
