var mary = require('./mary');
mary.transcribe("This is one sentence. This is another sentence. Are they part of one large sentence?", function (err, t) {
  for (var i = 0; i < t.length; i++) {
    if (!t[i].transcription) {
      console.log("  * [ '" + t[i].original + "' ]");
      continue;
    }
    var phones = t[i].transcription.split(" ");
    var stressed = false;
    if (phones[0] == '\'')
    {
      stressed = true;
      phones.shift();
    }
    console.log(phones)
  }
})