#!/usr/bin/python
import sys, os
import urllib
import json

parent = os.path.dirname(os.path.realpath(__file__))
sys.path.append(parent + '/../../MITIE/mitielib')
from mitie import *


ners = {}
def load_ner(oid):
    if oid in ners:
        return ners[oid]

    ner = named_entity_extractor(oid + ".dat")
    ners[oid] = ner
    print 'loaded ner ' + oid
    return ner





#!/usr/bin/python
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer

PORT_NUMBER = 8080

#This class will handles any incoming request from
#the browser
class myHandler(BaseHTTPRequestHandler):

    #Handler for the GET requests
    def do_GET(self):
        print self.path
        if not self.path.startswith("/cms"):
            return self.send_response(404)

        qs = self.path.split('?')[1]
        ps = qs.split('&')
        m = {}
        for p in ps:
            nv = p.split('=')
            m[nv[0]] = urllib.unquote(nv[1]).decode('utf8')

        self.send_response(200)
        self.send_header('Content-type', 'text/json')
        self.end_headers()


        oid = m['id']
        ner = load_ner(oid)
        text = m['text']
        tokens = text.split()

        entities = ner.extract_entities(tokens)

        v = []
        for e in entities:
            range = e[0]
            tag = e[1]
            entity_text = " ".join(tokens[i] for i in range)
            v.append({"tag": tag, "text": entity_text})
            print "    " + tag + ": " + entity_text
        self.wfile.write(json.dumps(v))
        return

try:
    #Create a web server and define the handler to manage the
    #incoming request
    server = HTTPServer(('', PORT_NUMBER), myHandler)
    print 'Started httpserver on port ' , PORT_NUMBER

    #Wait forever for incoming htto requests
    server.serve_forever()

except KeyboardInterrupt:
    print '^C received, shutting down the web server'
    server.socket.close()

