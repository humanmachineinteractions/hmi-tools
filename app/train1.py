#!/usr/bin/python
import sys, os, urllib
import multiprocessing

parent = os.path.dirname(os.path.realpath(__file__))
sys.path.append(parent + '/../../MITIE/mitielib')
from mitie import *

from pymongo import MongoClient
from bson.objectid import ObjectId

def tokenize(text):
    if text is None or text == "":
        return []
    tokens = []
    s = ""
    for c in text:
        if c == " ":
            if s:
                tokens.append(s)
            s = ""
        elif c == "." or c == "," or c == "!" or c == "?":
            if s:
                tokens.append(s)
            s = ""
            tokens.append(c)
        else:
            s += c
    if s:
        tokens.append(s)
    return tokens

client = MongoClient('mongodb://localhost/')
db = client.hmi
oid = sys.argv[1]
os.remove(oid + ".dat")
urllib.urlopen("http://localhost:8080/cms/?id="+oid+"&delete=true")
corpus = db.corpus.find_one({'_id': ObjectId(oid)})
print "Training %s" % corpus['name']
trainer = ner_trainer("../../MITIE/MITIE-models/english/total_word_feature_extractor.dat")
for script_id in corpus['scripts']:
    script = db.scripts.find_one({'_id': script_id})
    print "  Script %s" % script['name']
    for seg_id in script['segments']:
        seg = db.segments.find_one({'_id': seg_id})
        text = tokenize(seg['text'])
        #print "    %s" % text
        sample = ner_training_instance(text)
        for item in seg['annotation']:
            if 'type' in item and item['type'] is not None:
                b = item['range'][0]
                e = item['range'][1] + 1
                sample.add_entity(xrange(b, e), item['type'])
                print "    %s // %s" % (' '.join(text[b:e]), item['type'])
        trainer.add(sample)

trainer.num_threads = multiprocessing.cpu_count()
print "TRAINING"
ner = trainer.train()
print "complete ... save model"
ner.save_to_disk(oid + ".dat")



