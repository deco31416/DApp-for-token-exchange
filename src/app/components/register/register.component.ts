import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private service: RegisterService, private router:Router) { }

  formRegister: FormGroup;

  ngOnInit(): void {

    this.formRegister = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    })
  }

  singUp() {
    this.service.userRegister(this.formRegister.value)
  }

  goBack(){
    this.router.navigate(['/login']);
  }

}
