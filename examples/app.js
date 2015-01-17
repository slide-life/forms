$(function() {
  Forms.createForm($(".form"), [
    Forms.selectField("Name", ["Matt"], true),
    Forms.selectField("Sex", ["Male", "Female"], true)]);
  Forms.listen();
});

