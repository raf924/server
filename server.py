# -*- coding: utf-8 -*-

import sqlite3, cherrypy, os, os.path, random, string, json

DB_STRING = "../metadata.db"

class CalibreApp(object):

	@cherrypy.expose
	def index(self):
		return open('index.html')

	@cherrypy.expose
	def booklist(self,titre=''):
		with sqlite3.connect(DB_STRING) as con:
			c = con.cursor()
			c.execute("SELECT title, data.name, authors.name, path  FROM books INNER JOIN data on books.id = data.book INNER JOIN books_authors_link ON data.book = books_authors_link.book INNER JOIN authors on author = authors.id WHERE format = 'EPUB' AND title LIKE '%"+titre+"%'")
			data  = c.fetchall()
			return json.dumps(data)

if __name__ == '__main__':
	cherrypy.config.update({'server.socket_host':'0.0.0.0'})
	cherrypy.quickstart(CalibreApp(),'/', { '/': {'tools.staticdir.root':os.path.abspath(os.getcwd()),'tools.staticdir.on':True,'tools.staticdir.dir':'./'}, '/book':{'tools.staticdir.on':True,'tools.staticdir.dir':'../'}})