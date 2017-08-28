Developing with Escher
----------------------

If you are interested in developing Escher or just want to try out the source
code, this is the place to start.  You might also want to check out the the
`Gitter chat room`_ and the `Development Roadmap`_.

Using the static JavaScript and CSS files
=========================================

You can include the compiled Escher JavaScript and CSS files in any HTML
document. The only dependencies are `d3.js`_, and optionally `Twitter
Bootstrap`_ if you are using the option ``menu='all'``.

The compiled files are available from unpkg::

  https://unpkg.com/escher-vis/js/dist/escher.js
  https://unpkg.com/escher-vis/js/dist/escher.min.js
  https://unpkg.com/escher-vis/css/dist/builder.css
  https://unpkg.com/escher-vis/css/dist/builder.min.css

Source maps are also hosted there::

  https://unpkg.com/escher-vis/js/dist/escher.js.map
  https://unpkg.com/escher-vis/js/dist/escher.min.js.map
  https://unpkg.com/escher-vis/css/dist/builder.min.css.map

If you want a particular version of escher, add a version tag like this::

  https://unpkg.com/escher-vis@1.4.0-beta.3/js/dist/escher.js

Or, if you use NPM, you can simply install `escher-vis` -- the name `escher` was
already taken::

  npm install --save escher-vis

For an example of the boilerplate code that is required to begin developing with
Escher, have a look at the `escher-demo repository`_. For projects built with
npm, use the `escher-test repository`_ as a guide.

Building and testing Escher
===========================

First, install dependencies with npm::

  npm install

Escher uses grunt to manage the build process. To run typical build steps, just run::

  npm run compile

To test the JavaScript files, run::

  npm run test

For Python testing, run this in the ``py`` directory::

  python setup.py test

Build the static website::

  python setup.py build_gh

Clear static website files::

  python setup.py clean

Build and run the docs::

  cd docs
  make html
  cd _build/html
  python -m SimpleHTTPServer # python 2
  python -m http.server # python 3

Generating and reading Escher and COBRA files
=============================================

The Escher file format
^^^^^^^^^^^^^^^^^^^^^^

Escher layouts are defined by JSON files that follow a specific schema, using
`json schema`_. The latest schema for Escher JSON files is here_. The Escher
schemas are versioned, with inspiration from SchemaVer_. The ``escher.validate``
module can be used to validate models against the schema.

The Escher layout schema is designed to be as simple as possible. For example,
the `core metabolism map`_ of Escherichia coli is layed out like this:

::

    [
        {
            "map_name": "E coli core.Core metabolism",
            "map_id": "2938hoq32a1",
            "map_description": "E. coli core metabolic network\nLast Modified Fri Dec 05 2014 16:39:44 GMT-0800 (PST)",
            "homepage": "https://escher.github.io",
            "schema": "https://escher.github.io/escher/jsonschema/1-0-0#"
        },
        {
            "reactions": { ... },
            "nodes": { ... },
            "text_label": { ... },
            "canvas": {
                "x": 7.857062530517567,
                "y": 314.36893920898433,
                "width": 5894.515691375733,
                "height": 4860.457037353515
            }
        },
    ]

The ``map_name`` includes the model that was used to build this layout, followed by
a period and then a readable name for the map. The ``map_id`` is a unique
identifier for this map. The ``map_description`` describes the map and the last
time it was modified. Both the ``homepage`` and the ``schema`` entries must have
exactly these values for the Escher map to be valid.

In the next section, the reactions, nodes, labels, and canvas are all
defined. For reactions, nodes, and text labels, each element has a key that is
an arbitrary integer. As long as there are no repeated IDs (e.g. no 2 segments
with the ID 517), then everything should work fine.

Read through the schema (here_) for more detail on the format.

The COBRA file format
^^^^^^^^^^^^^^^^^^^^^

COBRA models are also saved as JSON files. This format has not been documented
with a schema, but you can browse through the `core metabolism model`_ as a
guide to generating valid COBRA models.

I still need help!
^^^^^^^^^^^^^^^^^^

If you are interested in developing with Escher and you need more information
than what is provided in the documentation, please contact Zachary King
(zaking-AT-ucsd-DOT-edu).

.. _`Gitter chat room`: https://gitter.im/zakandrewking/escher
.. _`Development roadmap`: https://github.com/zakandrewking/escher/wiki/Development-Roadmap
.. _`d3.js`: http://d3js.org/
.. _`Twitter Bootstrap`: http://getbootstrap.com
.. _`localhost:7778`: http://localhost:7778
.. _`escher-demo repository`: https://github.com/escher/escher-demo
.. _`escher-test repository`: https://github.com/escher/escher-test
.. _`json schema`: http://json-schema.org/
.. _here: https://github.com/zakandrewking/escher/blob/master/jsonschema/1-0-0
.. _SchemaVer: http://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
.. _`core metabolism map`: https://raw.githubusercontent.com/escher/escher.github.io/master/1-0-0/maps/Escherichia%20coli/E%20coli%20core.Core%20metabolism.json
.. _`core metabolism model`: https://raw.githubusercontent.com/escher/escher.github.io/master/1-0-0/models/Escherichia%20coli/E%20coli%20core.json
