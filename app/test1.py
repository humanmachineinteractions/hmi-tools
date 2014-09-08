
oid = sys.argv[1]
text = sys.argv[2]
tokens = text.split()

ner = named_entity_extractor(oid + ".dat")
entities = ner.extract_entities(tokens)

print text
print "Number of entities detected:", len(entities)

for e in entities:
    range = e[0]
    tag = e[1]
    entity_text = " ".join(tokens[i] for i in range)
    print "    " + tag + ": " + entity_text

