var express = require('express');
var sqlite = require('sqlite3').verbose();
var db = new sqlite.Database('C:\\Users\\Rafaël\\Documents\\Calibre\\metadata.db');
var app = express();

app.get('/', function (req, res) {
	db.serialize(function () {
		var title = req.query.title||'';
		var author = req.query.author||'';
		var page = req.params.page||0;
		db.all("SELECT COUNT(*) as value FROM books UNION SELECT GROUP_CONCAT(DISTINCT format) FROM data", function (err, rows) {
			var pages = Math.round(rows[0]['value']/20);
			var formats = rows[1]['value'];
			res.render('index.ejs', {title: title, author: author, pages: pages, formats: formats,page:page});
		});
	});
}).get('/books/:page',function (req, res) {
	var title = req.query.title||'';
	var author = req.query.author||'';
	var page = req.params.page||0;
	var formats = req.query.formats;
	var format = "";
	if(req.query.formats){
		for(var i = 0; i< formats.toString().split(',').length;i++){
			if(req.query.formats[formats.toString().split(',')[i]]){
				if(format != "")format += ',';
				format += "'"+formats.toString().split(',')[i]+"'";	

			}

		}
		format = '('+format+')';
	}
	db.serialize(function () {
		db.all("SELECT books.id as id"+
			"FROM books INNER JOIN data on books.id = data.book INNER JOIN books_authors_link ON data.book = books_authors_link.book INNER JOIN authors on author = authors.id INNER JOIN comments on comments.book = books.id "+
			"WHERE title LIKE '%"+title+"%' AND authors.name LIKE '%"+author+"%' /* AND data.format IN "+format+" */ GROUP BY books.id, title, data.name, authors.name, path, books.has_cover LIMIT 20 OFFSET "+page*20, function (err, rows) {
				res.render('books.ejs', {books:rows, title: title, author: author, formats: formats, page:page});
			});
	});	
}).get('/info/:id', function (req, res) {
	db.serialize(function () {
		db.get("SELECT books.has_cover as cover, title, data.name as name, authors.name as author, path, GROUP_CONCAT(data.format) as formats, comments.text as comment FROM books INNER JOIN data on books.id = data.book INNER JOIN books_authors_link ON data.book = books_authors_link.book INNER JOIN authors on author = authors.id LEFT OUTER JOIN comments ON comments.book = books.id WHERE books.id = "+req.params.id+" WHERE books.id = "+req.params.id+" GROUP BY title, data.name, authors.name, path, comments.text, books.has_cover", function(err, rows){
			res.render('book.ejs',{formats: rows['formats'], name: rows['name'], title:rows['title'], path:rows['path'], cover:rows['cover'], comment:rows['comment'],author:rows['author']});
		});
	});
}).use('/book',express.static(__dirname+'/..')).use('/public',express.static(__dirname+'/public')).use('/views',express.static(__dirname+'/views'));

app.listen(9000,'0.0.0.0');