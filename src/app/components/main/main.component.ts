import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MainService } from '../../services/main.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private service: MainService, private authentication: AngularFireAuth, private route: Router) { }

  //variables
  userEmail: string = '';
  currentUser: any; //Usuario actual 
  ventas: any; //lista las ventas activas
  compras: any; //lista de compras activas
  ventaSeleted: any; //muestra la venta en la ventana de dialogo
  formConfirmSale: FormGroup; //formulario de confirmacion de venta


  ngOnInit(): void {
    this.loadUser();

    //inicializando formulario de confirmacion

    this.formConfirmSale = new FormGroup(
      {
        compradorId: new FormControl('', [Validators.required]),
        tokensNumber: new FormControl('', [Validators.required]),
        venderId: new FormControl('', [Validators.required]),
        codeOp: new FormControl('', [Validators.required])
      }
    )
  }

  //carga la Informacion del Usuario
  loadUser() {
    this.service.loadData().subscribe(
      resultado => {
        var user;
        user = resultado.map(item => {
          return {
            id: item.payload.doc.id,
            data: item.payload.doc.data()
          }
        })

        this.authentication.authState.subscribe(
          result => {
            if (result) {
              this.userEmail = result.email;
              user.forEach(element => {
                if (element.data['email'] == this.userEmail) {
                  this.currentUser = element;
                }
              });

              this.loadCompras(this.currentUser.id);
              this.loadVentas(this.currentUser.id);
              if (this.currentUser.data.status == 2) {
                Swal.fire({
                  title: "Bienvenido a TokSale's",
                  text: 'Al ser nuevo usuario te regalamos 100 Tokens, ¡ Genial ! ',
                  icon: 'success',
                  confirmButtonText: 'continuar'
                }).then(
                  result => {
                    if (result.value) {
                      var data = this.currentUser.data;
                      data['status'] = 1;
                      this.service.welcome(this.currentUser.id, data);
                    }
                  }
                )
              }
            }
          }
        )
      })
  }


  //cargas las ventas

  loadVentas(id) {

    this.service.loadVentas(id).subscribe(
      resultado => {
        this.ventas = resultado.map(
          ventas => {
            return {
              id: ventas.payload.doc.id,
              data: ventas.payload.doc.data()
            }
          })

      }
    )

  }


  //carga las compras

  loadCompras(userId) {
    this.service.loadCompras(userId).subscribe(
      resultado => {
        this.compras = resultado.map(myBuys => {
          return {
            id: myBuys.payload.doc.id,
            data: myBuys.payload.doc.data()
          }
        })
      }
    )

  }

  //mostrar modal de confirmacion

  verComprador(venta) {
    this.ventaSeleted = venta;
  }

  //confirmar venta
  confirmSale() {
    this.service.confirmSale(this.currentUser.id, this.ventaSeleted);
  }
  // ir a la tienda
  goShop() {
    this.route.navigate(['/shop']);
  }

  singOut() {
    this.authentication.signOut();
  }


}
