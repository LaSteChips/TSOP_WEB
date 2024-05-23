const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const DataManager = require('./datamanager');
const app = express();
const port = 3000;

const db = new DataManager('localhost', 'root', '', 'account');
db.Connect();

// Configurer le moteur de templates EJS
app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// pour accéder aux fichiers CSS
app.use(express.static(path.join(__dirname, 'pages')));

// Page d'accueil (également la page de connexion)
app.get('/', (req, res) => {
    res.render('login', { message: null });
});

// Page pour créer un compte
app.get('/create', (req, res) => {
    res.render('create', { message: null });
});

app.post('/create', (req, res) => {
    const { username, password } = req.body;
    const sql = 'INSERT INTO account_data (user, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            res.render('create', { message: 'Erreur lors de la création du compte.' });
            return;
        }
        res.render('create', { message: 'Compte créé avec succès.' });
    });
});

// Page pour supprimer un compte
app.get('/delete', (req, res) => {
    const sql = 'SELECT user FROM account_data';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.render('delete', { message: 'Erreur lors de la récupération des utilisateurs.', users: [], query: req.query });
            return;
        }
        res.render('delete', { message: null, users: results, query: req.query });
    });
});

app.post('/delete', (req, res) => {
    const { username, password } = req.body;
    const sql = 'DELETE FROM account_data WHERE user = ? AND password = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            res.redirect('/delete?error=1');
            return;
        }
        if (result.affectedRows > 0) {
            res.redirect('/delete?success=1');
        } else {
            res.redirect('/delete?error=1');
        }
    });
});

// Page pour se connecter et télécharger un fichier GitHub
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM account_data WHERE user = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.render('login', { message: 'Erreur lors de la connexion.' });
            return;
        }
        if (results.length > 0) {
            res.redirect('https://github.com/LaSteChips/TSOP/archive/refs/heads/main.zip');
        } else {
            res.render('login', { message: 'Identifiant ou mot de passe incorrect.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
