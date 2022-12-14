// import { ObjectId } from 'mongodb';
import Product from '../models/product.js';

export const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

export const postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product(
    title,
    imageUrl,
    price,
    description,
    null,
    req.user._id
  );
  product
    .save()
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // Esto devuleve true o undefined/false
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.product_id;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const postEditProduct = (req, res, next) => {
  const prodId = req.body.product_id;
  const updatTitle = req.body.title;
  const updateImageUrl = req.body.imageUrl;
  const updatePrice = req.body.price;
  const updateDescription = req.body.description;

  const product = new Product(
    updatTitle,
    updateImageUrl,
    updatePrice,
    updateDescription,
    prodId,
    req.user._id
  );
  product
    .save()
    .then(() => {
      console.log('Producto Actualizado!');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};

export const postDeleteProduct = (req, res, next) => {
  const prodId = req.body.product_id;
  Product.deleteById(prodId)
    .then(() => {
      console.log(`Producto con id: [${prodId}] eliminado.`);
      res.redirect('/admin/products');
    })
    .catch((err) => {
      console.log(err);
    });
};
