#!/usr/bin/python
import sys, os
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
corpus = db.corpus.find_one({'_id': ObjectId(sys.argv[1])})
print "Training %s" % corpus['name']
trainer = ner_trainer("../../MITIE/MITIE-models/english/total_word_feature_extractor.dat")
for script_id in corpus['scripts']:
    script = db.scripts.find_one({'_id': script_id})
    print "  Script %s" % script['name']
    for seg_id in script['segments']:
        seg = db.segments.find_one({'_id': seg_id})
        text = tokenize(seg['text'])
        print "    %s" % text
        sample = ner_training_instance(text)
        for item in seg['annotation']:
            print "    %s %s %s" % (item['range'][0], item['range'][1], item['type'])
            if item['type'] is not None:
                sample.add_entity(xrange(item['range'][0], item['range'][1]+1), item['type'])
        trainer.add(sample)


def do_train2():

    # The trainer can take advantage of a multi-core CPU.  So set the number of threads
    # equal to the number of processing cores for maximum training speed.
    trainer.num_threads = multiprocessing.cpu_count()

    # This function does the work of training.  Note that it can take a long time to run
    # when using larger training datasets.  So be patient.
    ner = trainer.train()

    # Now that training is done we can save the ner object to disk like so.  This will
    # allow you to load the model back in using a statement like:
    #   ner = named_entity_extractor("new_ner_model.dat").
    ner.save_to_disk("new_ner_model.dat")

    # But now let's try out the ner object.  It was only trained on a small dataset but it
    # has still learned a little.  So let's give it a whirl.  But first, print a list of
    # possible tags.  In this case, it is just "person" and "org".
    print "tags:", ner.get_possible_ner_tags()


    # Now let's make up a test sentence and ask the ner object to find the entities.
    tests = [
        "My name is David and I work at Human Machine Interactions",
        "This kind of work requires the attention of Mike Betterstein",
        "Hey dog hows tricks",
        "Hello Michel",
        "Hello user",
        "Hello how are you",
        "What time does Sheila want to go to the movies",
        "Did you find this 789 number, Ambrose?",
        "Do you like one or two bananas my friend?",
        "Oh good morning to you Brant"
    ]
    for t in tests:
        tokens = t.split()
        entities = ner.extract_entities(tokens)
        # Happily, it found the correct answers, "John Becker" and "HBU" in this case which we
        # print out below.
        print t
        print "Number of entities detected:", len(entities)
        for e in entities:
            range = e[0]
            tag = e[1]
            entity_text = " ".join(tokens[i] for i in range)
            print "    " + tag + ": " + entity_text
        print "\n"




