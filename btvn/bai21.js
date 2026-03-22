function KiemTra()
{
  var noiDung = document.getElementById("NoiDung").value;
  var soKyTu = document.getElementById("SoKyTu");
  if (noiDung.length > 200) alert("Bạn đã gõ quá số ký tự cho phép!");
  soKyTu.value = noiDung.length;
}
