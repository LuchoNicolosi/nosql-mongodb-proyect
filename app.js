import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
//CONTROLLERS-ROUTES
import { getError404 } from './controllers/error.js';
import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Database
import { mongoConnect } from './utils/db.js';

//Models
import User from './models/user.js';


//MIDDLEWARES
app.set('view engine', 'ejs'); // compilame las plantillas dinamicas con pug/ejs
app.set('views', 'views'); // y anda a buscar las plantillas a la carpeta views

app.use(bodyParser.urlencoded({ extended: false })); // no analiza todo tipo de cuerpos como ,archivos, json etc pero si analiza los cuerpos de un form

app.use(express.static(path.join(__dirname, 'public'))); //Esto me permite poder exportar la carpeta public,asi puedo usar css

app.use((req, res, next) => {
  User.findById('63653da6baf8268594dc9b5f')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use('/admin', adminRoutes); //solo las rutas que comiencen con /admin entraran en el archivo adminRoutes
app.use(shopRoutes);

app.use(getError404);

mongoConnect(() => {
  app.listen(port, () => {
    console.log(
      `Server corriendo en el puerto http://localhost:${port} con exito!`
    );
  });
});
