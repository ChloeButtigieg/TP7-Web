"use strict";

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

db.prepare('DROP TABLE IF EXISTS movies').run();
db.prepare('CREATE TABLE movies (' +
    'id  INTEGER PRIMARY KEY AUTOINCREMENT,' +
    'title TEXT,' +
    'year INTEGER,' +
    'actors TEXT,' +
    'plot TEXT,' +
    'poster TEXT' +
    ');').run();

exports.load = function(filename) {
    const movies = JSON.parse(fs.readFileSync(filename));
    let insert = db.prepare('INSERT INTO movies VALUES ' +
        '(@id, @title, @year,' +
        ' @actors, @plot, @poster)');
    let clear_and_insert_many = db.transaction((movies) => {
        db.prepare('DELETE FROM movies');
        for (let id of Object.keys(movies)) {
            insert.run(movies[id]);
        }
    });
    clear_and_insert_many(movies);
    return true;
};

exports.save = function(filename) {
    let movie_list = db.prepare('SELECT * FROM movies ORDER BY id').all();
    let movies = {};
    for (let movie of movie_list) {
        movies[movie.id] = movie;
    }
    fs.writeFileSync(filename, JSON.stringify(movies));
};

exports.list = function() {
    return db.prepare('SELECT * FROM movies ORDER BY id;').all();
};

exports.create = function(title, year, actors, plot, poster) {
    return db.prepare('INSERT INTO movies (title, poster, actors, plot, year) VALUES (?, ?, ?, ?, ?);').run(title, poster, actors, plot, year).lastInsertRowid;
};

exports.read = function(id) {
    let movie = db.prepare('SELECT * FROM movies WHERE id=?;').get(id);
    if (movie === undefined) return null;
    else return movie;
};

exports.update = function(id, title, year, actors, plot, poster) {
    let modification = db.prepare('UPDATE movies SET title=?, year=?, actors=?, plot=?, poster=? WHERE id=?;').run(title, year, actors, plot, poster, id).changes;
    if (modification == 0) return false;
    return true;
};

exports.delete = function(id) {
    let modification = db.prepare('DELETE FROM movies WHERE id=?').run(id).changes;
    if (modification == 0) return false;
    return true;
};