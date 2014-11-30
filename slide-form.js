$(function() {
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
});

