function validateForm() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  if (!username || !password) {
    alert("Vui lòng nhập User Name và Password!");
    return false;
  }
  return true;
}
