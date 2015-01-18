function InvalidFieldType (message) {
  this.message = message;
}

InvalidFieldType.prototype = new Error();

var Forms = {
  listen: function() {
    $(".form li input").click(function(evt) {
      evt.preventDefault();
    });
    $(".form li").click(function(evt) {
      if( $(this).hasClass("active") ) {
        $(this).removeClass("active");
      } else {
        $(this).siblings().removeClass("active");
        $(this).addClass("active");
      }
    });
    $(".form > li.select li").click(function(evt) {
      var $input = $(this).parents(".select").children("input");
      if( $(this).hasClass("other") ) {
        $input.prop("readonly", false);
        $input.focus();
      } else {
        $input.val($(this).text());
        $input.prop("readonly", true);
      }
    });
  },

  createField: function(field) {
    var className = "text";
    if( field.type == "select" ) {
      className = "select";
    }
    var item = $("<li></li>", {
      "class": className,
      "data-field": field.name
    });
    var input;
    if( className == "text" ) {
      input = $("<input>", {
        "type": field.type,
        "placeholder": "...",
        "autocorrect": "off",
        "autocapitalize": "off"
      });
      item.append(input);
    } else if( className == "select" ) {
      input = $("<input>", {
        "type": field.subType,
        "value": field.options[0],
        "readonly": true,
        "autocorrect": "off",
        "autocapitalize": "off"
      });
      var options = $("<ul>", {
        "class": "options"
      });
      field.options.forEach(function(option) {
        var optionElm = $("<li>");
        optionElm.text(option);
        options.append(optionElm);
      });
      if( field.custom ) {
        var otherElm = $("<li>", {
          "class": "other"
        });
        otherElm.text("Other");
        options.append(otherElm);
      }
      item.append(input);
      item.append(options);
    }

    input.focusin(function() { Forms.onSwitchIntoField(field, this); });
    input.focusout(function() { Forms.onSwitchOutOfField(field, this); });

    return item;
  },

  createForm: function(container, fields) {
    fields.forEach(function(field) {
      $(field).appendTo(container);
    });
  },

  textField: function(name) {
    return Forms.createField({ type: "text", name: name });
  },

  numberField: function(name) {
    return Forms.createField({ type: "number", name: name });
  },

  selectField: function(name, options, custom) {
    return Forms.createField({
      type: "select",
      subType: "text",
      name: name,
      options: options,
      custom: custom
    });
  },

  populateForm: function(fields) {
    $(function() {
      Forms.createForm($(".form"), fields);
      Forms.listen();
    });
  },

  serializeForm: function() {
    var fields = $(".form").children("li");
    var keystore = {};
    [].map.call(fields, function(field) {
      var key = $(field).data("field"),
          value = $(field).find("input").val();
      keystore[key] = value;
    });
    return JSON.stringify(keystore);
  },

  onSwitchIntoField: function(field, input_element) {
    input_element.removeClass("valid");
    input_element.removeClass("invalid");
  },

  onSwitchOutOfField: function(field, input_element) {
    var validate = Forms.fieldValidation(field);
    if (! validate(input_element.val())) {
      input_element.addClass("valid");
      input_element.removeClass("invalid");
    } else {
      input_element.addClass("invalid");
      input_element.removeClass("valid");
    }
  },

  fieldValidation: function (field) {
    return function (input) {
      if ('_validation' in field) {
        var regex = new RegExp(field['_validation']);
        return regex.test(input);
      }
    };
  },

  buildForm: function (form, identifiers) {
    Slide.Block.getFlattenedFieldsForIdentifiers(identifiers, function (fields) {
      var compiledFields = fields.map(function (field) {
        if (field._type === 'text') {
          return Forms.textField(field._description);
        } else if (field._type === 'number') {
          return Forms.numberField(field._description);
        } else if (field._type === 'image') {
          return Forms.textField(field._description);
        } else if (field._type === 'tel') {
          return Forms.textField(field._description);
        } else if (field._type === 'date') {
          return Forms.textField(field._description);
        } else if (field._type === 'select') {
          return Forms.selectField(field._description, field._options, true);
        } else if (field._type === 'list') {
          return Forms.textField(field._description);
        } else {
          throw new InvalidFieldType(field._type + ' is not a valid field type');
        }
      });
      Forms.createForm(form, compiledFields);
      Forms.listen();
    }, []);
  }
};
