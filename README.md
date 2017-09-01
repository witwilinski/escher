This a sample application embedding Escher visualization map into an angular website.

The Application does not have any backend part. File selected by the user is read directly by JS FileReader and then passed to d3 json reader.

Starting the App

As it is a plain JavaScript application with and only relative paths, there are two ways to run it.
One can either open webapp/index.html file in Chrome, or start a local python webserver in the root directory of the project:
for Python 3:
$ python -m http.server

and then browse to http://localhost:8000/webapp/

When you browse for a JSON Map file, the map gets loaded and displayed. Also node and gene statistics are calculated and displayed below the map itself. Node statistic show how many times a specific type of node occurs in the map. Gene statistics show the genes taking part in at least 2 reactions, together with a cumulative number of reactions a specific gene takes part in (calculated from the whole map)

Wit Wilinski
2017-09-01
 
