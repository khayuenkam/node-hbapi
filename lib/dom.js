var cheerio = require('cheerio');

exports.page = function(body, cb) {
  var $ = cheerio.load(body);

  if (!body) {
    cb(null, "Adf");
  } else {
    var data = [];

    $('#site-content .row').first().find('.post').each(function() {
      var el = $(this);
      
      var imageUrl = el.find('img').attr('src');
      var imageTitle = el.find('img').attr('title');
      var excerpt = el.find('.excerpt').text().trim();
      var title = el.find('a').attr('title');
      var url = el.find('a').attr('href').replace('http://hypebeast.com', '');

      
      data.push({
        title: title,
        url: url,
        image: {
          url: imageUrl,
          title: imageTitle
        },
        excerpt: excerpt
      });
    });

    cb(null, data);
  }
}
