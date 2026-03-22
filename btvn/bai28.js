window.addEventListener("DOMContentLoaded", function() {
  // Body background
  document.body.style.backgroundImage = "url('anh1.jpg')";
  document.body.style.backgroundRepeat = "no-repeat";

  // Textbox background
  var textbox = document.getElementById("txtBox");
  if (textbox) {
    textbox.style.backgroundImage = "url('anh2.jpg')";
    textbox.style.backgroundRepeat = "repeat-x";
  }

  // Textarea background
  var textarea = document.getElementById("txtArea");
  if (textarea) {
    textarea.style.backgroundImage = "url('anh3.jpg')";
    textarea.style.backgroundRepeat = "repeat-y";
  }
});
