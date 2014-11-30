var Slide = {
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
      "class": className
    });
    if( className == "text" ) {
      var input = $("<input>", {
	"type": field.type,
	"placeholder": field.name
      });
      item.append(input);
    } else if( className == "select" ) {
      var input = $("<input>", {
	"type": field.subType,
	"placeholder": field.name,
	"readonly": true
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
    return item;
  },
  createForm: function(container, fields) {
    fields.forEach(function(field) {
      $(field).appendTo(container);
    });
  },
  textField: function(name) {
    return Slide.createField({ type: "text", name: name });
  },
  numberField: function(name) {
    return Slide.createField({ type: "number", name: name });
  },
  selectField: function(name, options, custom) {
    return Slide.createField({
      type: "select",
      subType: "text",
      name: name,
      options: options,
      custom: custom
    });
  }
};
$(function() {
  Slide.createForm($(".form"), [
    Slide.textField("First Name"),
    Slide.textField("Last Name"),
    Slide.numberField("Card Number"),
    Slide.selectField("Sex", ["Male", "Female"], true)]);
  Slide.listen();
});

