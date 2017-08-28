# -*- coding: utf-8 -*-

from __future__ import print_function, unicode_literals

from escher.plots import (Builder, local_index, model_json_for_name,
                          map_json_for_name)
from escher.urls import get_url
from escher.urls import root_directory
from escher.escape import json_dump_and_escape, escape_json_or_null

import os, subprocess
from os.path import join
import tornado.ioloop
from tornado.web import RequestHandler, HTTPError, Application, asynchronous, StaticFileHandler
from tornado.httpclient import AsyncHTTPClient
from tornado import gen
import tornado.escape
from tornado.options import define, options, parse_command_line
import json
import re
from jinja2 import Environment, PackageLoader
from mimetypes import guess_type

from escher.version import __version__, __schema_version__, __map_model_version__

# set up jinja2 template location
env = Environment(loader=PackageLoader('escher', 'templates'))

# set directory to server
NO_CACHE = False
PORT = 7778
PUBLIC = False

def run(port=PORT, public=PUBLIC):
    global PORT
    global PUBLIC
    PORT = port
    PUBLIC = public
    print('serving directory %s on port %d' % (root_directory, PORT))
    application.listen(port, None if public else "localhost")
    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        print("bye!")

def stop():
    tornado.ioloop.IOLoop.instance().stop()

class BaseHandler(RequestHandler):
    def serve_path(self, path):
        # make sure the path exists
        if not os.path.isfile(path):
            raise HTTPError(404)
        # serve any raw file type
        with open(path, "rb") as file:
            data = file.read()
        # set the mimetype
        the_type = guess_type(path, strict=False)[0]
        self.set_header("Content-Type", ("application/octet-stream"
                                         if the_type is None
                                         else the_type))
        self.serve(data)

    def serve(self, data):
        if (NO_CACHE):
            self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.set_header('Access-Control-Allow-Origin', '*')
        self.write(data)
        self.finish()

class IndexHandler(BaseHandler):
    @asynchronous
    @gen.coroutine
    def get(self):
        # get the organisms, maps, and models
        response = yield gen.Task(AsyncHTTPClient().fetch, get_url('server_index', protocol='http'))
        if response.code == 200 and response.body is not None:
            server_index_json = response.body.decode('utf-8')
        else:
            server_index_json = None

        # get the cached maps and models
        index = local_index()

        # render the template
        template = env.get_template('homepage.html')
        data = template.render(escher=get_url('escher_min', 'local'),
                               boot_css=get_url('boot_css', 'local'),
                               homepage_css=get_url('homepage_css', 'local'),
                               favicon=get_url('favicon', 'local'),
                               logo=get_url('logo', 'local'),
                               documentation=get_url('documentation', protocol='https'),
                               github=get_url('github'),
                               github_releases=get_url('github_releases'),
                               homepage_js=get_url('homepage_js', 'local'),
                               map_download_url=get_url('map_download', 'local'),
                               server_index_json=escape_json_or_null(server_index_json),
                               local_index_json=json_dump_and_escape(index),
                               version=__version__,
                               web_version=False)

        self.set_header("Content-Type", "text/html")
        self.serve(data)

class BuilderHandler(BaseHandler):
    @asynchronous
    @gen.coroutine
    def get(self):
        # Builder options
        builder_kwargs = {}
        for a in ['starting_reaction', 'model_name', 'map_name', 'map_json',
                  'reaction_no_data_color', 'reaction_no_data_size',
                  'metabolite_no_data_color', 'metabolite_no_data_size',
                  'hide_secondary_nodes']:
            args = self.get_arguments(a)
            if len(args)==1:
                builder_kwargs[a] = (True if args[0].lower()=='true' else
                                     (False if args[0].lower()=='false' else
                                      args[0]))
        # array args
        for a in ['quick_jump', 'metabolite_size_range', 'metabolite_color_range',
                  'reaction_size_range', 'reaction_color_range', 'gene_styles']:
            args = self.get_arguments(a + '[]')
            if len(args) > 0:
                builder_kwargs[a] = args

        # js source
        args = self.get_arguments('js_source')
        js_source = args[0] if len(args) == 1 else 'web'

        # example data
        def load_data_file(rel_path):
            """Load a JSON file with relative path."""
            try:
                with open(join(root_directory, rel_path), 'r') as f:
                    return json.load(f)
            except:
                logging.warn('Could not load testing_data file: %s' % rel_path)
        if len(self.get_arguments('testing_data')) > 0:
            r_filepath = 'escher/testing_data/reaction_data_iJO1366.json'
            builder_kwargs['reaction_data'] = load_data_file(r_filepath)
            m_filepath = 'escher/testing_data/metabolite_data_iJO1366.json'
            builder_kwargs['metabolite_data'] = load_data_file(m_filepath)

        # display options
        display_kwargs = {'minified_js': True,
                          'scroll_behavior': 'pan',
                          'menu': 'all'}

        # keyword
        for a in ['menu', 'scroll_behavior', 'minified_js',
                  'auto_set_data_domain', 'never_ask_before_quit',
                  'enable_editing']:
            args = self.get_arguments(a)
            if len(args)==1:
                display_kwargs[a] = (True if args[0].lower()=='true' else
                                     (False if args[0].lower()=='false' else
                                      args[0]))

        # make the builder
        builder = Builder(safe=True, **builder_kwargs)
        html = builder._get_html(js_source=js_source, enable_keys=True,
                                 html_wrapper=True, fill_screen=True,
                                 height='100%', **display_kwargs)

        self.set_header("Content-Type", "text/html")
        self.serve(html)

class MapModelHandler(BaseHandler):
    def get(self, path):
        try:
            kind, organism, name = path.strip('/').split('/')
        except (TypeError, ValueError):
            raise Exception('invalid path %s' % path)
        if kind == 'maps':
            b = Builder(map_name=name)
            self.set_header('Content-Type', 'application/json')
            self.serve(b.loaded_map_json)
        else:
            b = Builder(model_name=name)
            self.set_header('Content-Type', 'application/json')
            self.serve(b.loaded_model_json)

settings = {'debug': True}

application = Application([
    (r'.*escher/static/(.*)', StaticFileHandler, {'path': join(root_directory, 'escher', 'static')}),
    (r'/builder/index.html', BuilderHandler),
    (r'/%s/%s(/.*)' % (__schema_version__, __map_model_version__), MapModelHandler),
    (r'/', IndexHandler),
], **settings)

if __name__ == '__main__':
    # define port
    define('port', default=PORT, type=int, help='Port to serve on.')
    define('public', default=PUBLIC, type=bool,
           help=('If False, listen only on localhost. If True, listen on '
                 'all available addresses.'))
    parse_command_line()
    run(port=options.port, public=options.public)
