var DEFAULT_ORGANIZATION = 'slide.life';
var cached_blocks = {};

// TODO: check for circular dependencies
function retrieveField(wrapper, block, cb) {
  var field = wrapper.path.reduce(function (obj, key) {
    // TODO: check that key is set on object
    return obj[key];
  }, block.schema);

  var deferreds = [];

  if (field._components) {
    field._components.forEach(function (identifier) {
      var deferred = new $.Deferred();
      deferreds.push(deferred);
      retrieveFieldFromIdentifier(identifier, function (f) {
        field[identifier.split('.').pop()] = f;
        deferred.resolve();
      });
    });
  }

  // TODO: bug
  if (field._inherits) {
    var deferred = new $.Deferred();
    deferreds.push(deferred);
    retrieveFieldFromIdentifier(field._inherits, function (f) {
      field = $.extend({}, f, field);
      console.log(field);
      deferred.resolve();
    });
  }

  $.when.apply($, deferreds).done(function () {
    delete field._components;
    delete field._inherits;
    cb(field);
  });
}

function retrieveBlocks(identifier, cb) {
  if (identifier.indexOf(':') == -1) {
    identifier = DEFAULT_ORGANIZATION + ':' + identifier;
  }

  var i = identifier.split(':'),
      wrapper = { organization: i[0], path: i[1].split('.') };

  if (cached_blocks[wrapper.organization]) {
    cb(wrapper, cached_blocks[wrapper.organization]);
  } else {
    $.get('http://localhost:9292/blocks?organization=' + wrapper.organization, function (block) {
      cb(wrapper, block);
    });
  }
}

function retrieveFieldFromIdentifier(identifier, cb) {
  retrieveBlocks(identifier, function (wrapper, blocks) {
    retrieveField(wrapper, blocks, function (field) {
      cb(field);
    });
  });
}

function flattenField(field, cb) {
  var children = [],
      annotations = {};

  for (var key in field) {
    if (field.hasOwnProperty(key)) {
      if (key[0] === '_') {
        annotations[key] = field[key];
      } else {
        children.push(field[key]);
      }
    }
  }

  if (children.length > 0) {
    // Ignore the parent
    return children.reduce(function (c, child) {
      return c.concat(flattenField(child, cb));
    }, []);
  } else {
    return [cb(annotations)]; // On a leaf
  }
}

function InvalidFieldType (message) {
  this.message = message;
}

InvalidFieldType.prototype = new Error();

function buildForm(fields) {
  var compiledFields = fields.reduce(function (f, field) {
    return f.concat(flattenField(field, function (leaf) {
      console.log(leaf);
      if (leaf._type === 'text') {
        return Forms.textField(leaf._description);
      } else if (leaf._type === 'number') {
        return Forms.numberField(leaf._description);
      } else if (leaf._type === 'image') {
        return Forms.textField(leaf._description);
      } else if (leaf._type === 'tel') {
        return Forms.textField(leaf._description);
      } else if (leaf._type === 'date') {
        return Forms.textField(leaf._description);
      } else if (leaf._type === 'select') {
        return Forms.selectField(leaf._description, leaf._options, true);
      } else if (leaf._type === 'list') {
        return Forms.textField(leaf._description);
      } else {
        throw new InvalidFieldType(leaf._type + ' is not a valid field type');
      }
    }));
  }, []);

  Forms.createForm($('.form'), compiledFields);
  Forms.listen();
}

$(function() {
  var requested_blocks = ['bank.card', 'name'];
  var fields = [],
      deferreds = [];

  requested_blocks.map(function (identifier) {
    var deferred = new $.Deferred();
    deferreds.push(deferred);
    retrieveFieldFromIdentifier(identifier, function (field) {
      fields.push(field);
      deferred.resolve();
    });
  });

  $.when.apply($, deferreds).done(function () {
    buildForm(fields);
  });
});

