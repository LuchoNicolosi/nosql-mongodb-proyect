import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

let db;

export const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://lucho:4PjaOQ4U3Y9Guq90@cluster0.wsjsk4g.mongodb.net/shop?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('Conectado a la DB');
      db = client.db(); //Cree una nueva instancia de base de datos que {comparta las conexiones de socket} actuales.
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

export const getDb = () => {
  if (db) {
    return db;
  }
  throw 'Base de datos no encontrada!';
};
