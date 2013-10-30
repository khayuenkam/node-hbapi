var cheerio = require('cheerio');

exports.page = function(body, cb) {
  var $ = cheerio.load(body);

  if (!body) {
    cb(null, "Adf");
  } else {
    var data = [];

    $('#site-content .row').first().find('.post').each(function() {
      var el = $(this);
      
      var $image = el.find('img');
      var $link = el.find('a');

      var imageUrl = $image.attr('src');
      var imageTitle = $image.attr('title');
      var excerpt = el.find('.excerpt').text().trim();
      var title = $link.attr('title');
      var url = $link.attr('href').replace('http://hypebeast.com', '');
      var type = el.find('.info a:nth-child(1)').attr('title');

      data.push({
        title: title,
        url: url,
        image: {
          url: imageUrl,
          title: imageTitle
        },
        excerpt: excerpt,
        type: type,
      });
    });

    cb(null, data);
  }
}

