var cheerio = require('cheerio');

var detail = exports.detail = function(body, cb) {
  var $ = cheerio.load(body);

  if (checkNoPageFound($)) {
    cb(new Error('No Such Page'));
  } else {
    var title = $('#post-title').text();
    var content = $('#post-content').html();
    var video = $('#post-video iframe').attr('src');

    var $tags = $('#post-tags');
    var author = ''
      , tags = []
      , photographer = ''
      , gallery = [];

    $tags.find('.title').each(function() {
      var el = $(this);

      var text = el.text().toLowerCase();

      if (text.indexOf('author') !== -1) {
        author = el.next().text();
      }

      if (text.indexOf('photographer') !== -1) {
        photographer = el.next().text();
      }

      if (text.indexOf('tags') !== -1) {
        tags = el.next().text().replace(/\s/g, '').split(',');
      }
    });

    $('#post-gallery .picture').each(function() {
      var el = $(this);

      gallery.push(el.find('img').attr('src'));
    });

    var $info = $('#post-info');
    var $infoUrl = $info.find('a');
    var type = $infoUrl.attr('title');
    var typeUrl = $infoUrl.attr('href');

    var data = {
      title: title,
      video: video,
      gallery: gallery,
      content: content,
      author: author,
      photographer: photographer,
      tags: tags,
      type: type,
      typeUrl: typeUrl
    };

    cb(null, data);
  }
}

exports.page = function(body, cb) {
  var $ = cheerio.load(body);

  if (checkNoPageFound($)) {
    cb(new Error('No Such Page'));
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

exports.publication = function(body, cb) {
  var $ = cheerio.load(body);

  if (checkNoPageFound($)) {
    cb(new Error('No Such Page'));
  } else {
    var magazine = [];

    $('.magazine-slide-container').children('li:not(.clone)').each(function() {
      var el = $(this);
      var content = {};
      var $contentContainer = el.find('.magazine-content-container');

      var $span = $contentContainer.find('.span6');

      content.issue = {
        title: $span.find('h3').text(),
        name: $span.find('h4').text()
      }

      var $content = $contentContainer.find('.pull-left');

      $content.each(function() {
        var el2 =  $(this);

        el2.find('h5').each(function() {
          var el3 = $(this);
          var list = [];

          el3.next().children('li').each(function() {
            list.push($(this).text());
          });

          content[el3.text()] = list;
        });
      });

      magazine.push({
        photoUrl: el.find('.magazine-photo-contaniner img').attr('src'),
        content: content
      });
    });

    console.log(magazine);
    cb(null, { magazine: magazine });
  }
}

var checkNoPageFound = function($) {
  if ($('.page-header h1').text().indexOf('This is not the page you are looking for.') !== -1) {
    return true;
  }

  return false;
}
