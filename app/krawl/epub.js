var EPub = require('epub');
var epub = new EPub('/Users/david/Desktop/EPUB/E38E7B6EF04A19001ECDD99830D6E00F.epub');

epub.on("end", function () {
  // epub is now usable
  console.log(epub.metadata.title);

  epub.flow.forEach(function (chapter) {
    console.log(chapter.id);
  });
//epub.getChapter("chapter1", function(error, text){});
});
epub.parse();



