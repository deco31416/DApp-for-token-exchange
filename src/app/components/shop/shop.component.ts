import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ShopService } from '../../services/shop.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  constructor(private authentication: AngularFireAuth, private route: Router, private service: ShopService) { }

  ngOnInit(): void {

    this.loadUser();
    this.loadShop();

    //Creando Formulario de Venta

    this.formSaleToken = new FormGroup(
      {
        cantidad: new FormControl('', [Validators.required]),
        precio: new FormControl('', [Validators.required])
      });

    this.formBuyToken = new FormGroup(
      {
        mensaje: new FormControl('', [Validators.required]),
        vendedorId: new FormControl('', [Validators.required]),
        codeOp: new FormControl('', [Validators.required]),
        compradorId: new FormControl('', [Validators.required]),
        ventaCantidad: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)]),
        ventaPrecio: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)]),
        ventaFecha: new FormControl('', [Validators.required,]),
        ventaStatus: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required])
      });

    this.formGenerarCompra = new FormGroup(
      {
        cantidad: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)]),
        precio: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)]),
        userEmail: new FormControl('', [Validators.required])
      }
    );
    this.formSendToken = new FormGroup({
      cantidad: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)]),
      precio: new FormControl('', [Validators.required, Validators.pattern(this.validarNumero)])
    })




  }

  // variables 
  tokenSelected: any;
  ofertSelected: any;//oferta Selecionada
  userEmail: string = ''; //email del usuario actual
  currentUser: any; //datos del usuario actual
  shopTokens: any; // tokens disponible para la compra
  myTokenSale: any; //mi lista de tokens en venta
  myTokenBuy: any; //mi lista de tokens en compra
  ofertaComprar: any; //mis ofertas de compra
  formSaleToken: FormGroup; //formulario de Venta
  formBuyToken: FormGroup; //formulario para enviar aplicacion de Compra
  formGenerarCompra: FormGroup; //formulario para generar oferta de compra
  formSendToken: FormGroup; //fomulario para enviar Tokens a una oferta de compra 

  validarNumero: any = /^\d*$/;//Valida que solo sean numeros


  //carga el usuario actual para la tienda
  loadUser() {
    this.service.loadDataUser().subscribe(
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

              this.loadMyTokenSale(this.currentUser.id);
              this.loadBuyToken(this.currentUser.id);
              this.loadOfertasCompra(this.currentUser.id);

            }
          }
        )
      })
  }

  //carga los tokens de la tienda
  loadShop() {
    this.service.loadShop().subscribe(resultado => {
      this.shopTokens = resultado.map(tokens => {
        return {
          id: tokens.payload.doc.id,
          data: tokens.payload.doc.data()
        }
      })
      this.shopTokens.sort((a, b) => {
        if (a.data.fecha > b.data.fecha) {
          return -1;
        } else {
          return 1;
        }
      })
    })
  }

  //carga los tokens que he puesto en venta
  loadMyTokenSale(userId) {
    this.service.loadUserSales(userId).subscribe(
      resultado => {
        this.myTokenSale = resultado.map(mySales => {
          return {
            id: mySales.payload.doc.id,
            data: mySales.payload.doc.data()
          }
        })
      }
    )
  }

  //carga los tokens que tengo en compra
  loadBuyToken(userId) {
    this.service.loadUserSales(userId).subscribe(
      resultado => {
        this.myTokenBuy = resultado.map(mySales => {
          return {
            id: mySales.payload.doc.id,
            data: mySales.payload.doc.data()
          }
        })
      }
    )

  }
  //carga las ofertas de Compra
  loadOfertasCompra(userId) {
    this.service.loadOfert(userId).subscribe(
      resultado => {
        this.ofertaComprar = resultado.map(
          ofertas => {
            return {
              id: ofertas.payload.doc.id,
              data: ofertas.payload.doc.data()
            }
          }
        )
      }
    )
  }

  //registra una venta
  realizarVenta() {
    if (this.formSaleToken.valid) {
      if (this.currentUser.data.misTokens >= this.formSaleToken.get('cantidad').value && this.formSaleToken.get('cantidad').value > 0 && this.formSaleToken.get('precio').value > 0 ) {
        this.service.tokenSale(this.currentUser.id, this.formSaleToken.value).then(
          resultado => {
            this.formSaleToken.reset();
            Swal.fire({
              title: "Exito",
              text: 'Operacio Satisfactoria',
              icon: 'success',
              confirmButtonText: 'continuar'
            })
            this.formSaleToken.reset();
          }
        )
      }
      else {
        Swal.fire({
          title: "Disculpa",
          text: 'Tienes ' + this.currentUser.data.misTokens + ' Tokens Disponibles, la cantidad y precio debe ser mayor que 0 ',
          icon: 'warning',
          confirmButtonText: 'Esta bien'
        })
      }
    } else {
      Swal.fire({
        title: "Disculpa",
        text: 'No dejes campos vacios, recuerda que son solo numeros',
        icon: 'warning',
        confirmButtonText: 'Esta bien'
      })
    }
  }
  //tranfiere los tokens una vez concratada la venta

  //realizar una compra
  realizarCompra() {
    this.formBuyToken.get('vendedorId').setValue(this.tokenSelected.data.userId);
    this.formBuyToken.get('codeOp').setValue(this.tokenSelected.id);
    this.formBuyToken.get('compradorId').setValue(this.currentUser.id);
    this.formBuyToken.get('ventaCantidad').setValue(this.tokenSelected.data.cantidad);
    this.formBuyToken.get('ventaFecha').setValue(this.tokenSelected.data.fecha);
    this.formBuyToken.get('ventaPrecio').setValue(this.tokenSelected.data.precio);
    this.formBuyToken.get('ventaStatus').setValue(2);
    this.formBuyToken.get('email').setValue(this.currentUser.data.email);
    if (this.formBuyToken.valid) {
      if (this.formBuyToken.get('ventaPrecio').value > 0 && this.formBuyToken.get('ventaCantidad').value > 0) {
        this.service.realizarCompra(this.formBuyToken.value);
        Swal.fire({
          title: "Genial",
          text: 'Tu Solicitud de compra va en Camino',
          icon: 'success',
          confirmButtonText: 'Continuar'
        })
        this.formBuyToken.reset();
      } else {
        Swal.fire({
          title: "Disculpa",
          text: 'La cantidad y el precio debe ser mayor de 0',
          icon: 'success',
          confirmButtonText: 'Continuar'
        })
      }
    } else {
      Swal.fire({
        title: "Disculpa",
        text: 'Verifica los campos',
        icon: 'warning',
        confirmButtonText: 'Esta bien'
      })
    }

  }

  //realizar una oferta de compra

  ofertarCompra() {
    this.formGenerarCompra.get('userEmail').setValue(this.currentUser.data.email);
    if (this.formGenerarCompra.valid) {
      if (this.formGenerarCompra.get('cantidad').value > 0 && this.formGenerarCompra.get('precio').value > 0) {
        this.service.tokenOfertarCompra(this.currentUser.id, this.formGenerarCompra.value);
        Swal.fire({
          title: "Genial",
          text: 'Tu oferta ya esta en la Seccion de Arriba',
          icon: 'success',
          confirmButtonText: 'Continuar'
        })
        this.formGenerarCompra.reset();
      } else {
        Swal.fire({
          title: "Vaya",
          text: 'Debes ingresar una cantidad y precio mayor de 0',
          icon: 'warning',
          confirmButtonText: 'Continuar'
        })
      }
    } else {
      Swal.fire({
        title: "Vaya Vaya",
        text: 'Ingresa una cantidad y precio mayor de 0',
        icon: 'warning',
        confirmButtonText: 'Esta bien'
      })
    }
  }

  mostrarOfertaCompra(data) {
    this.ofertSelected = data;
  }

  // Envia los tokens a una oferta de compra
  concretarVenta() {
    if (this.formSendToken.valid) {
      if (this.currentUser.data.misTokens >= this.formSendToken.get('cantidad').value && this.formSendToken.get('cantidad').value > 0) {
        this.service.enviarToken(this.currentUser.id, this.ofertSelected.data.userId, this.formSendToken.value, this.ofertSelected.id);
        Swal.fire({
          title: "Genial",
          text: 'Los Tokens se han enviado',
          icon: 'success',
          confirmButtonText: 'Vale'
        })
        this.formSendToken.reset();
      } else {
        Swal.fire({
          title: "Ups",
          text: 'Tienes '+this.currentUser.data.misTokens+' Disponibles, ingresa una cantidad y precio mayor que 0',
          icon: 'warning',
          confirmButtonText: 'Esta bien'
        })
      }
    } else {
      Swal.fire({
        title: "Ups",
        text: 'Recuerda llenar todos los campos',
        icon: 'warning',
        confirmButtonText: 'Esta bien'
      })
    }
  }

  //despliega el modal con los datos de la oferta
  mostrarSolicitud(tokensSelected) {
    this.tokenSelected = tokensSelected;
  }

  //funcion Volver atras
  goBack() {
    this.route.navigate(['/main']);
  }

  //metodos get del formulario, necesarios para el binding
  //formulario de Venta
  get cantidad() {
    return this.formSaleToken.get('cantidad');
  }

  get precio() {
    return this.formSaleToken.get('precio');
  }

  get userId() {
    return this.formSaleToken.get('userId');
  }

  //formulario de Compra

  get vendedorId() {
    return this.formBuyToken.get('vendedorId');
  }

  get codeOp() {
    return this.formBuyToken.get('codeOp')
  }

}
