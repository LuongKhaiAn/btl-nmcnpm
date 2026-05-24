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

app.get("/api/booking/options", async (req, res) => {
  try {
    const [[movies], [schedules], [seats], [bookedSeats]] = await Promise.all([
      db.query(`
        SELECT
          MaPhim AS id,
          TenPhim AS title,
          TheLoai AS genre,
          ThoiLuong AS duration,
          DaoDien AS director,
          DienVien AS cast,
          QuocGia AS country,
          DATE_FORMAT(NgayKhoiChieu, '%Y-%m-%d') AS releaseDate,
          NoiDung AS description,
          CASE
            WHEN NgayKhoiChieu > CURDATE() THEN 'Sắp chiếu'
            ELSE 'Đang chiếu'
          END AS status
        FROM PHIM
        ORDER BY NgayKhoiChieu DESC, MaPhim DESC
      `),
      db.query(`
        SELECT
          lc.MaLichChieu AS id,
          lc.MaPhim AS movieId,
          p.TenPhim AS movie,
          lc.MaPhong AS roomId,
          pc.TenPhong AS room,
          pc.LoaiPhong AS format,
          DATE_FORMAT(lc.NgayChieu, '%Y-%m-%d') AS date,
          TIME_FORMAT(lc.GioChieu, '%H:%i') AS time,
          lc.GiaVe AS price
        FROM LICHCHIEU lc
        JOIN PHIM p ON p.MaPhim = lc.MaPhim
        JOIN PHONGCHIEU pc ON pc.MaPhong = lc.MaPhong
        ORDER BY lc.NgayChieu ASC, lc.GioChieu ASC
      `),
      db.query(`
        SELECT
          g.MaGhe AS id,
          g.MaPhong AS roomId,
          g.TenGhe AS name,
          g.LoaiGhe AS type,
          g.TrangThai AS status
        FROM GHE g
        ORDER BY g.MaPhong ASC, g.TenGhe ASC
      `),
      db.query(`
        SELECT
          MaLichChieu AS scheduleId,
          MaGhe AS seatId
        FROM VE
      `),
    ]);

    res.json({ movies, schedules, seats, bookedSeats });
  } catch (error) {
    res.status(500).json({
      message: "Không thể tải dữ liệu đặt vé.",
      error: error.message,
    });
  }
});

app.post("/api/booking", async (req, res) => {
  const { scheduleId, seatId, customerName, phone, email } = req.body;

  if (!scheduleId || !seatId || !customerName || !phone) {
    res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin đặt vé." });
    return;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingTickets] = await connection.query(
      "SELECT MaVe FROM VE WHERE MaLichChieu = ? AND MaGhe = ? LIMIT 1",
      [scheduleId, seatId],
    );

    if (existingTickets.length > 0) {
      await connection.rollback();
      res.status(409).json({ message: "Ghế này đã được đặt cho suất chiếu đã chọn." });
      return;
    }

    const [scheduleRows] = await connection.query(
      "SELECT GiaVe FROM LICHCHIEU WHERE MaLichChieu = ? LIMIT 1",
      [scheduleId],
    );

    if (scheduleRows.length === 0) {
      await connection.rollback();
      res.status(404).json({ message: "Không tìm thấy lịch chiếu." });
      return;
    }

    const [customerRows] = await connection.query(
      "SELECT MaKhachHang FROM KHACHHANG WHERE SoDienThoai = ? LIMIT 1",
      [phone],
    );

    let customerId = customerRows[0]?.MaKhachHang;

    if (!customerId) {
      const [customerResult] = await connection.query(
        "INSERT INTO KHACHHANG (HoTen, SoDienThoai, Email) VALUES (?, ?, ?)",
        [customerName, phone, email || null],
      );
      customerId = customerResult.insertId;
    }

    const [ticketResult] = await connection.query(
      `
        INSERT INTO VE
          (MaLichChieu, MaGhe, MaKhachHang, NgayDat, GiaVe, TrangThaiThanhToan)
        VALUES
          (?, ?, ?, NOW(), ?, 'Chưa thanh toán')
      `,
      [scheduleId, seatId, customerId, scheduleRows[0].GiaVe],
    );

    await connection.commit();

    res.status(201).json({
      message: "Đặt vé thành công.",
      ticketId: ticketResult.insertId,
      customerId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Không thể tạo vé.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

app.post("/api/admin/movies", async (req, res) => {
  const {
    tenPhim,
    theLoai,
    thoiLuong,
    daoDien,
    dienVien,
    quocGia,
    ngayKhoiChieu,
    noiDung,
  } = req.body;

  if (!tenPhim || !theLoai || !thoiLuong || !ngayKhoiChieu) {
    res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin bắt buộc: tên phim, thể loại, thời lượng, ngày khởi chiếu.",
    });
    return;
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO PHIM (TenPhim, TheLoai, ThoiLuong, DaoDien, DienVien, QuocGia, NgayKhoiChieu, NoiDung)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [tenPhim, theLoai, thoiLuong, daoDien || null, dienVien || null, quocGia || null, ngayKhoiChieu, noiDung || null],
    );

    res.status(201).json({
      message: "Thêm phim thành công.",
      movieId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể thêm phim.",
      error: error.message,
    });
  }
});

app.post("/api/admin/schedules", async (req, res) => {
  const { maPhim, maPhong, ngayChieu, gioChieu, giaVe } = req.body;

  if (!maPhim || !maPhong || !ngayChieu || !gioChieu || giaVe === undefined) {
    res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin bắt buộc: phim, phòng, ngày, giờ, giá vé.",
    });
    return;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingSchedule] = await connection.query(
      "SELECT MaLichChieu FROM LICHCHIEU WHERE MaPhong = ? AND NgayChieu = ? AND GioChieu = ? LIMIT 1",
      [maPhong, ngayChieu, gioChieu],
    );

    if (existingSchedule.length > 0) {
      await connection.rollback();
      res.status(409).json({
        message: "Suất chiếu này đã tồn tại cho phòng, ngày và giờ đã chọn.",
      });
      return;
    }

    const [result] = await connection.query(
      `
        INSERT INTO LICHCHIEU (MaPhim, MaPhong, NgayChieu, GioChieu, GiaVe)
        VALUES (?, ?, ?, ?, ?)
      `,
      [maPhim, maPhong, ngayChieu, gioChieu, giaVe],
    );

    await connection.commit();

    res.status(201).json({
      message: "Tạo suất chiếu thành công.",
      scheduleId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Không thể tạo suất chiếu.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

app.post("/api/admin/tickets", async (req, res) => {
  const { maLichChieu, maGhe } = req.body;

  if (!maLichChieu || !maGhe) {
    res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin bắt buộc: suất chiếu, ghế.",
    });
    return;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingTickets] = await connection.query(
      "SELECT MaVe FROM VE WHERE MaLichChieu = ? AND MaGhe = ? LIMIT 1",
      [maLichChieu, maGhe],
    );

    if (existingTickets.length > 0) {
      await connection.rollback();
      res.status(409).json({ message: "Ghế này đã được đặt cho suất chiếu này." });
      return;
    }

    const [scheduleRows] = await connection.query(
      "SELECT GiaVe FROM LICHCHIEU WHERE MaLichChieu = ? LIMIT 1",
      [maLichChieu],
    );

    if (scheduleRows.length === 0) {
      await connection.rollback();
      res.status(404).json({ message: "Không tìm thấy suất chiếu." });
      return;
    }

    const [ticketResult] = await connection.query(
      `
        INSERT INTO VE (MaLichChieu, MaGhe, NgayDat, GiaVe, TrangThaiThanhToan)
        VALUES (?, ?, NOW(), ?, ?)
      `,
      [maLichChieu, maGhe, scheduleRows[0].GiaVe, "Đã thanh toán"],
    );

    await connection.commit();

    res.status(201).json({
      message: "Bán vé tại quầy thành công.",
      ticketId: ticketResult.insertId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Không thể tạo vé.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

app.get("/api/customer/account", async (req, res) => {
  const customerId = Number(req.query.customerId || 1);

  try {
    const [[customers], [tickets]] = await Promise.all([
      db.query(
        `
          SELECT
            MaKhachHang AS id,
            HoTen AS name,
            SoDienThoai AS phone,
            Email AS email
          FROM KHACHHANG
          WHERE MaKhachHang = ?
          LIMIT 1
        `,
        [customerId],
      ),
      db.query(
        `
          SELECT
            v.MaVe AS id,
            p.TenPhim AS movie,
            pc.TenPhong AS room,
            g.TenGhe AS seat,
            DATE_FORMAT(lc.NgayChieu, '%d/%m/%Y') AS date,
            TIME_FORMAT(lc.GioChieu, '%H:%i') AS time,
            DATE_FORMAT(v.NgayDat, '%d/%m/%Y %H:%i') AS bookedAt,
            v.GiaVe AS price,
            v.TrangThaiThanhToan AS paymentStatus
          FROM VE v
          JOIN LICHCHIEU lc ON lc.MaLichChieu = v.MaLichChieu
          JOIN PHIM p ON p.MaPhim = lc.MaPhim
          JOIN PHONGCHIEU pc ON pc.MaPhong = lc.MaPhong
          JOIN GHE g ON g.MaGhe = v.MaGhe
          WHERE v.MaKhachHang = ?
          ORDER BY v.NgayDat DESC, v.MaVe DESC
        `,
        [customerId],
      ),
    ]);

    if (customers.length === 0) {
      res.status(404).json({ message: "Không tìm thấy tài khoản khách hàng." });
      return;
    }

    res.json({
      customer: customers[0],
      tickets,
      stats: {
        ticketCount: tickets.length,
        totalSpent: tickets
          .filter((ticket) => ticket.paymentStatus === "Đã thanh toán")
          .reduce((sum, ticket) => sum + Number(ticket.price || 0), 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể tải thông tin khách hàng.",
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
