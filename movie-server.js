"use strict";

let express = require('express');
let mustache = require('mustache-express');

let app = express();

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');
app.use('/public', express.static('public'));

let movies = require('./movies_sql');
movies.load('movies.json');

app.get('/', (req, res) => {
    let movie_list = {moviesList: movies.list()};

    res.render('movie-list', movie_list);
})

app.get('/movie-details/:id', (req, res) => {
    res.render('movie-details', movies.read(req.params.id));
});

app.get('/add-movie-form', (req, res) => {
    res.render('add-movie-form');
});
app.get('/add-movie', (req, res) => {
    movies.create(req.query.title, req.query.year, req.query.actors, req.query.plot, req.query.poster);
    movies.save("movies.json");
    res.redirect('/');
});

app.get('/edit-movie-form/:id', (req, res) => {
    res.render('edit-movie-form', movies.read(req.params.id));
});
app.get('/edit-movie/:id', (req, res) => {
    movies.update(req.params.id, req.query.title, req.query.year, req.query.actors, req.query.plot, req.query.poster);
    movies.save("movies.json");
    res.redirect('/');
});

app.get('/delete-movie-form/:id', (req, res) => {
    res.render('delete-movie-form', movies.read(req.params.id));
});
app.get('/delete-movie/:id', (req, res) => {
    movies.delete(req.params.id);
    movies.save("movies.json");
    res.redirect('/');
});


app.listen(3000, () => console.log('movie server at http://localhost:3000'));