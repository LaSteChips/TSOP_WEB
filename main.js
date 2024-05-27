require('dotenv').config(); // Ajoutez cette ligne en haut

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const DataManager = require("./datamanager");

const app = express();
const port = 3000;

const db = new DataManager("localhost", "root", "", "account");
db.Connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// Définir le dossier contenant les fichiers statiques (CSS, images, etc.)
app.use(express.static(__dirname));

app.set('view engine', 'ejs');
app.set('views', './pages');

// Page de connexion
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM account_data WHERE username = ?", [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          req.session.user = results[0];
          res.redirect('https://github.com/LaSteChips/TSOP/archive/refs/heads/main.zip');
        } else {
          res.send('Mot de passe incorrect !');
        }
      });
    } else {
      res.send('Utilisateur non trouvé !');
    }
  });
});

// Page de création de compte
app.get('/signup', (req, res) => {
    db.query("SELECT * FROM account_data", (err, users) => {
      if (err) throw err;
      res.render('signup', { users: users });
    });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    db.query("INSERT INTO account_data (username, password) VALUES (?, ?)", [username, hash], (err, results) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
});

// Page de suppression de compte
app.get('/delete', (req, res) => {
    db.query("SELECT * FROM account_data", (err, users) => {
        if (err) throw err;
    res.render('delete', { users: users });
    });
});

// Page de suppression de compte
app.post('/delete', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM account_data WHERE username = ?", [username], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        bcrypt.compare(password, results[0].password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            db.query("DELETE FROM account_data WHERE username = ?", [username], (err, results) => {
              if (err) throw err;
              res.redirect('/signup'); // Redirection vers la page de création de compte
            });
          } else {
            res.send('Mot de passe incorrect !');
          }
        });
      } else {
        res.send('Utilisateur non trouvé !');
      }
    });
  });  

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
