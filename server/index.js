require("dotenv").config();

const cors = require("cors");
const express = require("express");
const db = require("./db");

const app = express();
const port = process.env.SERVER_PORT || 5000;
const host = process.env.SERVER_HOST || "127.0.0.1";

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db/ping", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS connected");
    res.json({
      connected: rows[0]?.connected === 1,
      database: process.env.DB_NAME,
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      message: "Không thể kết nối MySQL.",
      error: error.message,
    });
  }
});

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const [
      [movies],
      [schedules],
      [rooms],
      [seats],
      [tickets],
      [customers],
      [employees],
      [revenueRows],
      [todayTicketRows],
      [showtimeRows],
      [paidSeatRows],
    ] = await Promise.all([
      db.query(`
        SELECT
          p.MaPhim AS id,
          p.TenPhim AS title,
          p.TheLoai AS genre,
          p.ThoiLuong AS duration,
          p.DaoDien AS director,
          p.DienVien AS cast,
          p.QuocGia AS country,
          DATE_FORMAT(p.NgayKhoiChieu, '%Y-%m-%d') AS releaseDate,
          p.NoiDung AS description,
          CASE
            WHEN p.NgayKhoiChieu > CURDATE() THEN 'Sắp chiếu'
            ELSE 'Đang chiếu'
          END AS status,
          COUNT(DISTINCT lc.MaLichChieu) AS showtimes,
          COUNT(DISTINCT v.MaVe) AS soldTickets,
          COUNT(DISTINCT g.MaGhe) AS totalSeats
        FROM PHIM p
        LEFT JOIN LICHCHIEU lc ON lc.MaPhim = p.MaPhim
        LEFT JOIN PHONGCHIEU pc ON pc.MaPhong = lc.MaPhong
        LEFT JOIN GHE g ON g.MaPhong = pc.MaPhong
        LEFT JOIN VE v ON v.MaLichChieu = lc.MaLichChieu
        GROUP BY p.MaPhim
        ORDER BY p.NgayKhoiChieu DESC, p.MaPhim DESC
      `),
      db.query(`
        SELECT
          lc.MaLichChieu AS id,
          p.TenPhim AS movie,
          pc.TenPhong AS room,
          DATE_FORMAT(lc.NgayChieu, '%d/%m/%Y') AS date,
          TIME_FORMAT(lc.GioChieu, '%H:%i') AS time,
          pc.LoaiPhong AS format,
          lc.GiaVe AS price,
          COUNT(DISTINCT v.MaVe) AS soldSeats,
          pc.SoLuongGhe AS totalSeats,
          CASE
            WHEN lc.NgayChieu < CURDATE() THEN 'Đã chiếu'
            WHEN COUNT(v.MaVe) >= pc.SoLuongGhe THEN 'Hết vé'
            WHEN COUNT(v.MaVe) >= pc.SoLuongGhe * 0.8 THEN 'Gần hết'
            ELSE 'Đang bán'
          END AS status
        FROM LICHCHIEU lc
        JOIN PHIM p ON p.MaPhim = lc.MaPhim
        JOIN PHONGCHIEU pc ON pc.MaPhong = lc.MaPhong
        LEFT JOIN VE v ON v.MaLichChieu = lc.MaLichChieu
        GROUP BY lc.MaLichChieu
        ORDER BY lc.NgayChieu ASC, lc.GioChieu ASC
      `),
      db.query(`
        SELECT
          pc.MaPhong AS id,
          pc.TenPhong AS name,
          pc.LoaiPhong AS type,
          pc.SoLuongGhe AS seats,
          pc.TrangThai AS status,
          SUM(CASE WHEN g.TrangThai = 'Bảo trì' THEN 1 ELSE 0 END) AS maintenance,
          COUNT(g.MaGhe) AS configuredSeats
        FROM PHONGCHIEU pc
        LEFT JOIN GHE g ON g.MaPhong = pc.MaPhong
        GROUP BY pc.MaPhong
        ORDER BY pc.MaPhong ASC
      `),
      db.query(`
        SELECT
          g.MaGhe AS id,
          g.TenGhe AS name,
          g.LoaiGhe AS type,
          g.TrangThai AS status,
          g.MaPhong AS roomId
        FROM GHE g
        ORDER BY g.MaPhong ASC, g.TenGhe ASC
      `),
      db.query(`
        SELECT
          v.MaVe AS id,
          kh.HoTen AS customer,
          p.TenPhim AS movie,
          pc.TenPhong AS room,
          g.TenGhe AS seats,
          DATE_FORMAT(v.NgayDat, '%d/%m/%Y %H:%i') AS bookedAt,
          v.GiaVe AS total,
          v.TrangThaiThanhToan AS status,
          CASE
            WHEN v.MaKhachHang IS NULL THEN 'Tại quầy'
            ELSE 'Online'
          END AS channel
        FROM VE v
        JOIN LICHCHIEU lc ON lc.MaLichChieu = v.MaLichChieu
        JOIN PHIM p ON p.MaPhim = lc.MaPhim
        JOIN PHONGCHIEU pc ON pc.MaPhong = lc.MaPhong
        JOIN GHE g ON g.MaGhe = v.MaGhe
        LEFT JOIN KHACHHANG kh ON kh.MaKhachHang = v.MaKhachHang
        ORDER BY v.NgayDat DESC, v.MaVe DESC
        LIMIT 20
      `),
      db.query(`
        SELECT
          kh.MaKhachHang AS id,
          kh.HoTen AS name,
          kh.SoDienThoai AS phone,
          kh.Email AS email,
          COUNT(v.MaVe) AS visits
        FROM KHACHHANG kh
        LEFT JOIN VE v ON v.MaKhachHang = kh.MaKhachHang
        GROUP BY kh.MaKhachHang
        ORDER BY kh.MaKhachHang ASC
      `),
      db.query(`
        SELECT
          nv.MaNhanVien AS id,
          nv.HoTen AS name,
          nv.ChucVu AS role,
          nv.TaiKhoan AS username
        FROM NHANVIEN nv
        ORDER BY nv.MaNhanVien ASC
      `),
      db.query(`
        SELECT COALESCE(SUM(GiaVe), 0) AS revenue
        FROM VE
        WHERE TrangThaiThanhToan = 'Đã thanh toán'
      `),
      db.query(`
        SELECT COUNT(*) AS tickets
        FROM VE
        WHERE DATE(NgayDat) = CURDATE()
      `),
      db.query(`
        SELECT COUNT(*) AS showtimes
        FROM LICHCHIEU
        WHERE NgayChieu = CURDATE()
      `),
      db.query(`
        SELECT
          COALESCE(SUM(scheduleSeats.paidSeats), 0) AS paidSeats,
          COALESCE(SUM(scheduleSeats.totalSeats), 0) AS totalSeats
        FROM (
          SELECT
            lc.MaLichChieu,
            COUNT(DISTINCT v.MaVe) AS paidSeats,
            pc.SoLuongGhe AS totalSeats
          FROM LICHCHIEU lc
          JOIN PHONGCHIEU pc ON pc.MaPhong = lc.MaPhong
          LEFT JOIN VE v ON v.MaLichChieu = lc.MaLichChieu
          WHERE lc.NgayChieu = CURDATE()
          GROUP BY lc.MaLichChieu
        ) AS scheduleSeats
      `),
    ]);

    const people = [
      ...customers.map((customer) => ({
        ...customer,
        id: `C${customer.id}`,
        role: "Khách hàng",
      })),
      ...employees.map((employee) => ({
        ...employee,
        id: `E${employee.id}`,
        phone: employee.username,
        visits: "-",
      })),
    ];

    res.json({
      movies: movies.map((movie) => ({
        ...movie,
        occupancy: movie.totalSeats
          ? Math.round((movie.soldTickets / movie.totalSeats) * 100)
          : 0,
      })),
      schedules: schedules.map((schedule) => ({
        ...schedule,
        seats: `${schedule.soldSeats}/${schedule.totalSeats}`,
      })),
      rooms: rooms.map((room) => ({
        ...room,
        maintenance: Number(room.maintenance || 0),
        active: Number(room.configuredSeats || 0) - Number(room.maintenance || 0),
      })),
      seats,
      tickets,
      people,
      metrics: {
        revenue: Number(revenueRows[0]?.revenue || 0),
        tickets: Number(todayTicketRows[0]?.tickets || 0),
        showtimes: Number(showtimeRows[0]?.showtimes || 0),
        occupancy: paidSeatRows[0]?.totalSeats
          ? Math.round((paidSeatRows[0].paidSeats / paidSeatRows[0].totalSeats) * 100)
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể tải dữ liệu quản trị.",
      error: error.message,
    });
  }
});

const server = app.listen(port, host, () => {
  console.log(`API server is running at http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error("Không thể khởi động API server:", error.message);
  process.exit(1);
});
