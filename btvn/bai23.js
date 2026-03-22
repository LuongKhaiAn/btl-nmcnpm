function tinhThanhTien() {
  var soLuong = parseFloat(document.getElementById("SoLuong").value) || 0;
  var donGia = parseFloat(document.getElementById("DonGia").value) || 0;
  document.getElementById("ThanhTien").value = soLuong * donGia;
}
