import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ShopService {

  constructor(private firestore: AngularFirestore) { }

  //carga los Tokens en venta

  loadShop() {
    return this.firestore.collection('tiendaTokens').snapshotChanges();
  }

  //carga el usuario actual

  loadDataUser() {
    return this.firestore.collection('users').snapshotChanges();
  }

  //carga las ventas que tiene activa el usuario

  loadUserSales(userId) {
    return this.firestore.collection('users').doc(userId).collection('ventas').snapshotChanges();
  }

  //carga las compras que tiene el usuario

  loadUserBuy(userId) {
    return this.firestore.collection('users').doc(userId).collection('compra').snapshotChanges();
  }

  //carga las ofertas de compra que he realizado
  loadOfert(userId) {
    return this.firestore.collection('users').doc(userId).collection('ofertaCompra').snapshotChanges();
  }
  //Realiza el registro de una venta
  tokenSale(userId, data) {
    const { cantidad, precio } = data;
    const fecha = Date.now();
    const datos = { cantidad, precio, fecha, status: 1, tipo: 1 }
    var updateMyTokens;

    this.firestore.collection('users').doc(userId).get().subscribe(
      result => {
        updateMyTokens = result.data();
        updateMyTokens['misTokens'] = updateMyTokens['misTokens'] - cantidad;
        this.firestore.collection('users').doc(userId).update(updateMyTokens);
      }
    )
    //registra la venta para en el usuario actual
    return this.firestore.collection('users').doc(userId).collection("ventas").add(datos).then(exito => {
      if (exito) {
        const codeOp = exito.id;
        const tokens = { cantidad, precio, fecha, status: 1, codeOp, userId, tipo: 1 }

        //registra la venta en la tienda, esto genera un id para la operacion y le da una identidad al token
        this.firestore.collection('tiendaTokens').doc(codeOp).set(tokens).then(
          success => {
            return true
          }
        ).catch(
          error => {
            return false;
          }
        )

        return true;

      }
      else {
        return false;
      }
    });

  }

  //realiza una publicacion que estas comprando
  tokenOfertarCompra(userId, data) {
    const { cantidad, precio, userEmail} = data;
    const fecha = Date.now();
    const datos = { precio, cantidad, fecha, status: 1, tipo: 2, email:userEmail }
    //registra la oferta en el usuario actual
    return this.firestore.collection('users').doc(userId).collection("ofertaCompra").add(datos).then(exito => {
      if (exito) {
        const tokens = { precio, cantidad, fecha, status: 1, userId, tipo: 2, email:userEmail}
       //registra la venta en la tienda, esto genera un id para la operacion y le da una identidad al token
        this.firestore.collection('tiendaTokens').doc(exito.id).set(tokens).then(
          success => {
            return true
          }
        ).catch(
          error => {
            return false;
          }
        )

        return true;

      }
      else {
        return false;
      }
    });

  }

  //realiza la solicitud de compra
  realizarCompra(data) {
    var statusOperaciones = [];
    const { vendedorId, codeOp, mensaje, compradorId, ventaCantidad, ventaPrecio, ventaStatus, ventaFecha, email } = data;
    var fechaAcual = Date.now();

    //para notificar al vendedor
    const updateVenta = { cantidad: ventaCantidad, precio: ventaPrecio, fecha: ventaFecha, status: ventaStatus, mensaje: mensaje, compradorId, email };

    //para actualizar al comprador
    const newCompra = { cantidad: ventaCantidad, precio: ventaPrecio, fecha: fechaAcual, status: ventaStatus, vendedorId, codeOp };

    //para actualizar la tienda

    const tienda = { cantidad: ventaCantidad, precio: ventaPrecio, fecha: ventaFecha, status: ventaStatus, vendedorId, codeOp }

    //actualiza el estado de la ventas activas para que se le notifique al usuario

    this.firestore.collection('users').doc(vendedorId).collection('ventas').doc(codeOp).set(updateVenta).then(
      success => {
        statusOperaciones.push({ updateVenta: true });
      }
    ).catch(
      error => {
        statusOperaciones.push({ updateVenta: false });
      }
    )
    //actualiza las compras del usuario actual

    this.firestore.collection('users').doc(compradorId).collection('compras').add(newCompra).then(
      success => {
        statusOperaciones.push({ updateCompra: true })
      }
    ).catch(
      error => {
        statusOperaciones.push({ updateCompra: false });
      }
    );

    //actualiza la tienda para que no este disponible

    this.firestore.collection('tiendaTokens').doc(codeOp).set(tienda);

    return statusOperaciones;


  }

  //realiza la venta para la oferta de compra
  enviarToken(userId, compradorId, data,codeOp) {

    const { cantidad, precio } = data;
    const fecha = Date.now();
    const datos = { cantidad, precio, fecha, status: 0, tipo: 1 , compradorId:compradorId, codeOp}

    //actualiza los tokens de ambas partes
    this.firestore.collection('users').doc(userId).get().subscribe(
      result => {
        var restarTokens;
        restarTokens = result.data();
        restarTokens['misTokens'] = restarTokens['misTokens'] - cantidad;
        this.firestore.collection('users').doc(userId).update(restarTokens);
      });
      
    this.firestore.collection('users').doc(compradorId).get().subscribe(
      result => {
        var sumarTokens;
        sumarTokens = result.data();
        sumarTokens['misTokens'] = sumarTokens['misTokens'] + cantidad;
        this.firestore.collection('users').doc(compradorId).update(sumarTokens);
      }
    )

    this.firestore.collection('users').doc(userId).collection('ventas').add(datos);
    this.firestore.collection('tiendaTokens').doc(codeOp).delete();
    this.firestore.collection('users').doc(compradorId).collection('ofertaCompra').doc(codeOp).delete();
  }

}
