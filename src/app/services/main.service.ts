import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) { }

  //welcome se encarga de la primera vez que el usuario entra
  welcome(userId,data){
    this.firestore.collection('users').doc(userId).update(data);
  }

  //carga los datos del usuario actual
  loadData() {
    return this.firestore.collection('users').snapshotChanges();
  }
  //carga las ventas del Usuario Actual
  loadVentas(currentUser) {
    return this.firestore.collection('users').doc(currentUser).collection('ventas').snapshotChanges();
  }
  //carga las compras a las que ha aplicado el usuario actual
  loadCompras(currentUser) {
    return this.firestore.collection('users').doc(currentUser).collection('compras').snapshotChanges();
  }
  //confirma rVenta
  confirmSale(me, data) {
    //Data recibe los datos de la compra, como el id e informacion del comprador;

    var updateComprador;//actualiza los tokens del comprador
    var updateEstadoCompra = [];// actualiza el estado de la compra para el comprador

    this.firestore.collection('users').doc(data.data.compradorId).get().subscribe(
      result => {

        //calculo del total de tokens
        updateComprador = result.data();
        updateComprador['misTokens'] = updateComprador['misTokens'] + data.data.cantidad;

        //actualizacion del comprador
        //tokens
        this.firestore.collection('users').doc(data.data.compradorId).update(updateComprador).then(
          exito => {
          }
        );
        //compras
        this.firestore.collection('users').doc(data.data.compradorId).collection('compras').get().subscribe(
          result => {
            var update;
            result.docs.map(
              items => {
                updateEstadoCompra.push({ id: items.id, data: items.data() });
              }
            );
            updateEstadoCompra.forEach(elemento => {
              if (elemento.data.codeOp == data.id) {
                update = elemento;
                update.data['status'] = 1;
              }
            })
            this.firestore.collection('users').doc(data.data.compradorId).collection('compras').doc(update.id).set(update.data);

          }
        );

        //ventas
        this.firestore.collection('users').doc(me).collection('ventas').doc(data.id).get().subscribe(
          result => {
            var venta;
            venta = result.data();
            venta['status'] = 0;
            this.firestore.collection('users').doc(me).collection('ventas').doc(data.id).update(venta).then(
              success => {
              }
            ).catch(error => {
              console.log(error);
            })

          }
        )

        //tienda
        this.firestore.collection('tiendaTokens').doc(data.id).delete();
        Swal.fire({
          title: "Exito",
          text: 'Se ha completado la Operacion ',
          icon: 'success',
          confirmButtonText: 'continuar'
        })
      }
    )
  }



}
