/**
 * jQuery json-viewer
 * @author: Alexandre Bodelot <alexandre.bodelot@gmail.com>
 * @link: https://github.com/abodelot/jquery.json-viewer
 */
(function($) {

  /**
   * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
   * @return boolean
   */
  function isCollapsable(arg) {
    return arg instanceof Object && Object.keys(arg).length > 0;
  }

  /**
   * Check if a string looks like a URL, based on protocol
   * This doesn't attempt to validate URLs, there's no use and syntax can be too complex
   * @return boolean
   */
  function isUrl(string) {
    var protocols = ['http', 'https', 'ftp', 'ftps'];
    for (var i = 0; i < protocols.length; ++i) {
      if (string.startsWith(protocols[i] + '://')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return the input string html escaped
   * @return string
   */
  function htmlEscape(s) {
    return s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&apos;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Transform a json object into html representation
   * @return string
   */
  function json2html(json, options, parentPath = '') {
    var html = '';
    if (typeof json === 'string') {
      // Escape tags and quotes
      json = htmlEscape(json);

      if (options.withLinks && isUrl(json)) {
        html += '<a href="' + json + '" class="json-string" target="_blank">' + json + '</a>';
      } else {
        // Escape double quotes in the rendered non-URL string.
        json = json.replace(/&quot;/g, '\\&quot;');
        html += '<span class="json-string">"' + json + '"</span>';
      }
    } else if (typeof json === 'number' || typeof json === 'bigint') {
      html += '<span class="json-literal">' + json + '</span>';
    } else if (typeof json === 'boolean') {
      html += '<span class="json-literal">' + json + '</span>';
    } else if (json === null) {
      html += '<span class="json-literal">null</span>';
    } else if (json instanceof Array) {
      if (json.length > 0) {
        html += '[<ol class="json-array">';
        for (var i = 0; i < json.length; ++i) {
          html += '<li>';
          let currentPath = parentPath ? `${parentPath}.[${i}]` : `[${i}]`
          // Add toggle button if item is collapsable
          if (isCollapsable(json[i])) {
            html += '<a href class="json-toggle" data-json-path="' + currentPath + '"></a>';
          }
          html += json2html(json[i], options, currentPath);
          // Add comma if item is not last
          if (i < json.length - 1) {
            html += ',';
          }
          html += '</li>';
        }
        html += '</ol>]';
      } else {
        html += '[]';
      }
    } else if (typeof json === 'object') {
      // Optional support different libraries for big numbers
      // json.isLosslessNumber: package lossless-json
      // json.toExponential(): packages bignumber.js, big.js, decimal.js, decimal.js-light, others?
      if (options.bigNumbers && (typeof json.toExponential === 'function' || json.isLosslessNumber)) {
        html += '<span class="json-literal">' + json.toString() + '</span>';
      } else {
        var keyCount = Object.keys(json).length;
        if (keyCount > 0) {
          html += '{<ul class="json-dict">';
          for (var key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
              key = htmlEscape(key);
              let currentPath = `${parentPath ? parentPath + "." : ''}${key}`;
              var keyRepr = `<span class="json-string" data-json-path="${currentPath}">${options.withQuotes ? `"${key}"` : key}</span>`

              html += '<li>';
              // Add toggle button if item is collapsable
              if (isCollapsable(json[key])) {
                html += '<a href class="json-toggle"></a>' + keyRepr;
              } else {
                html += keyRepr;
              }
              html += ': ' + json2html(json[key], options, currentPath);
              // Add comma if item is not last
              if (--keyCount > 0) {
                html += ',';
              }
              html += '</li>';
            }
          }
          html += '</ul>}';
        } else {
          html += '{}';
        }
      }
    }
    return html;
  }

  /**
   * jQuery plugin method
   * @param json: a javascript object
   * @param options: an optional options hash
   */
  $.fn.jsonViewer = function(json, options) {
    // Merge user options with default options
    options = Object.assign({}, {
      collapsed: false,
      rootCollapsable: true,
      withQuotes: false,
      withLinks: true,
      bigNumbers: false,
      withPaths: false,
    }, options);

    // jQuery chaining
    return this.each(function() {

      // Transform to HTML
      var html = json2html(json, options);
      if (options.rootCollapsable && isCollapsable(json)) {
        html = '<a href class="json-toggle"></a>' + html;
      }

      // Insert HTML in target DOM element
      $(this).html(html);
      $(this).addClass('json-document');

      // Bind click on toggle buttons
      $(this).off('click');
      $(this).on('click', 'a.json-toggle', function() {
        var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
        target.toggle();
        if (target.is(':visible')) {
          target.siblings('.json-placeholder').remove();
        } else {
          var count = target.children('li').length;
          var placeholder = count + (count > 1 ? ' items' : ' item');
          target.after('<a href class="json-placeholder json-makeup-ignore">' + placeholder + '</a>');
        }
        return false;
      });

      // Simulate click on toggle button when placeholder is clicked
      $(this).on('click', 'a.json-placeholder', function() {
        $(this).siblings('a.json-toggle').click();
        return false;
      });

      if (options.collapsed == true) {
        // Trigger click to collapse all nodes
        $(this).find('a.json-toggle').click();
      }
    });
  };
})(jQuery);
