// JavaScript program to calculate the sum of two numbers
function calculateSum() {
  let num1 = parseFloat(document.getElementsByName("SoHang1")[0].value);
  let num2 = parseFloat(document.getElementsByName("SoHang2")[0].value);
  let sum = num1 + num2;
  document.getElementsByName("KetQua")[0].value = sum;
}
