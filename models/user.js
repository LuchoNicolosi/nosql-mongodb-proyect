import { ObjectId } from 'mongodb';
import { getDb } from '../utils/db.js';

export default class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items:[]} - El cart es un objeto
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cartItem) => {
      return cartItem.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updateCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updateCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updateCartItems.push({
        productId: ObjectId(product._id),
        quantity: newQuantity,
      });
    }
    const updateCart = {
      items: updateCartItems,
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne({ _id: Object(this._id) }, { $set: { cart: updateCart } });
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });

    return db
      .collection('products')
      .find({
        _id: {
          $in: productIds /*Este objeto me permite usar operadores de consulta especiales de mongodb*/,
        },
      })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      }); //Quiero encontrar todos los productos que estan en mi cart
  }

  deleteItemFromCart(productId) {
    const updateCart = this.cart.items.filter((p) => {
      return p.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: Object(this._id) },
        { $set: { cart: { items: updateCart } } }
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart() //1- Obtenemos el carrito, con variedades de productos
      .then((cartProducts) => {
        const order = {
          //2- Creo una order con esos datos
          items: cartProducts, //no me interesa que cambie la informacion del producto, no afecta a la orden
          user: {
            _id: ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection('orders').insertOne(order); //3- Inserto la order en la coleccion de orders
      })
      .then((result) => {
        this.cart = { items: [] }; //4- Se que tuve exito entonces vacio mi carrito
        return db
          .collection('users')
          .updateOne(
            { _id: Object(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    //Como encuentro todas las ordenes de un usuario?
    //Cada orden tiene un objeto user, y ese objeto user tiene la id de ese usuario, por lo que hay que comparar esa id con la id del usuario actual
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users').findOne({ _id: ObjectId(userId) });
  }
}
