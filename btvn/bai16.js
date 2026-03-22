function CapNhat() {

  var tieude = document.getElementsByName("TieuDe")[0].value;
  var maunen = document.getElementsByName("MauNen")[0].value;
  var mauchu = document.getElementsByName("MauChu")[0].value;
  var trangthai = document.getElementsByName("TrangThai")[0].value;

  document.title = tieude;
  document.bgColor = maunen;
  document.fgColor = mauchu;
  window.status = trangthai;

}
