from __future__ import print_function, unicode_literals

import json
from os import listdir
from os.path import join, dirname, realpath, exists, isdir, relpath
import sys
from collections import defaultdict
from escher import __schema_version__, __map_model_version__
from escher.urls import top_directory

def generate_index(directory):
    def list_cached(directory, kind):
        l = []
        if isdir(directory):
            for f in listdir(directory):
                tf = join(directory, f)
                if isdir(tf):
                    for f2 in listdir(tf):
                        if f2.endswith('.json'):
                            f2 = f2.replace('.json', '')
                            l.append({ 'organism': f,
                                       kind + '_name': f2 })
        return l
    return { 'maps': list_cached(join(directory, 'maps'), 'map'),
             'models': list_cached(join(directory, 'models'), 'model') }

def main():
    directory = join(top_directory, __schema_version__, __map_model_version__)
    if not exists(directory):
        print('No directory to index')
        sys.exit()
    print('Indexing %s' % directory)
    index = generate_index(directory)
    with open(join(directory, 'index.json'), 'w') as f:
        json.dump(index, f)
    print('Saved index.json')

if __name__=='__main__':
    main()
