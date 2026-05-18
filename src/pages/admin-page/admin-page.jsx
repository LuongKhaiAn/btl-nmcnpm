import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Container,
  Form,
  Navbar,
  ProgressBar,
  Row,
  Table,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import { logout } from "../../utils/auth";

const emptyDashboard = {
  movies: [],
  schedules: [],
  rooms: [],
  seats: [],
  tickets: [],
  people: [],
  metrics: {
    revenue: 0,
    tickets: 0,
    showtimes: 0,
    occupancy: 0,
  },
};

function getStatusVariant(status = "") {
  if (status.includes("Đã") || status === "Đang chiếu" || status === "Đang bán" || status === "Hoạt động") {
    return "success";
  }

  if (status.includes("Gần") || status.includes("Giữ") || status.includes("Chưa")) {
    return "warning";
  }

  return "secondary";
}

function getSeatState(status = "") {
  if (status.includes("Đã")) {
    return "booked";
  }

  if (status.includes("Giữ") || status.includes("Bảo trì")) {
    return "held";
  }

  return "available";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function AdminPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [dashboardStatus, setDashboardStatus] = useState({
    loading: true,
    message: "",
  });
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    connected: false,
    message: "",
  });

  useEffect(() => {
    async function checkDatabase() {
      try {
        const response = await fetch("/api/db/ping");
        const data = await response.json();

        setDbStatus({
          loading: false,
          connected: response.ok && data.connected,
          message: response.ok
            ? `Đã kết nối database ${data.database}.`
            : data.message,
        });
      } catch {
        setDbStatus({
          loading: false,
          connected: false,
          message: "Không thể gọi API kiểm tra MySQL.",
        });
      }
    }

    checkDatabase();
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải dữ liệu quản trị.");
        }

        setDashboard({
          ...emptyDashboard,
          ...data,
          metrics: {
            ...emptyDashboard.metrics,
            ...data.metrics,
          },
        });
        setSelectedRoomId(data.rooms?.[0]?.id ?? null);
        setDashboardStatus({ loading: false, message: "" });
      } catch (error) {
        setDashboard(emptyDashboard);
        setDashboardStatus({
          loading: false,
          message: error.message || "Không thể tải dữ liệu quản trị.",
        });
      }
    }

    loadDashboard();
  }, []);

  const filteredMovies = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return dashboard.movies;
    }

    return dashboard.movies.filter((movie) =>
      [movie.title, movie.genre, movie.status, movie.id]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  }, [dashboard.movies, keyword]);

  const selectedRoom = useMemo(
    () => dashboard.rooms.find((room) => room.id === selectedRoomId) || dashboard.rooms[0],
    [dashboard.rooms, selectedRoomId],
  );

  const roomSeats = useMemo(
    () => dashboard.seats.filter((seat) => seat.roomId === selectedRoom?.id),
    [dashboard.seats, selectedRoom],
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles["admin-shell"]}>
      <Navbar className={styles["admin-header"]}>
        <Navbar.Brand className={styles["brand"]}>cinemaX Admin</Navbar.Brand>
        <div className={styles["header-actions"]}>
          <Badge bg={dbStatus.connected ? "success" : "warning"} text={dbStatus.connected ? undefined : "dark"}>
            {dbStatus.loading ? "Đang kiểm tra MySQL" : dbStatus.connected ? "MySQL online" : "MySQL cần kiểm tra"}
          </Badge>
          <Button variant="outline-light" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </Navbar>

      <Container fluid className={styles["admin-page"]}>
        <section className={styles["overview"]}>
          <div>
            <p className={styles["eyebrow"]}>Bảng điều hành</p>
            <h1>Quản lý vận hành rạp cinemaX</h1>
            <p>
              Dữ liệu được tải trực tiếp từ MySQL: phim, lịch chiếu, phòng ghế,
              đặt vé, khách hàng, nhân viên và doanh thu.
            </p>
          </div>
          <Form className={styles["quick-search"]}>
            <Form.Label>Tìm kiếm nhanh</Form.Label>
            <Form.Control
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên phim, mã phim, thể loại..."
            />
          </Form>
        </section>

        <Alert variant={dbStatus.connected ? "success" : "warning"} className={styles["db-alert"]}>
          {dbStatus.loading ? "Đang kiểm tra kết nối MySQL..." : dbStatus.message}
        </Alert>

        {dashboardStatus.message && (
          <Alert variant="danger" className={styles["db-alert"]}>
            {dashboardStatus.message}
          </Alert>
        )}

        <Row className={styles["metric-grid"]}>
          <Col lg={3} md={6}>
            <div className={styles["metric-card"]}>
              <span>Doanh thu đã thanh toán</span>
              <strong>{formatCurrency(dashboard.metrics.revenue)}</strong>
              <small>Tổng từ bảng VE</small>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className={styles["metric-card"]}>
              <span>Vé đặt hôm nay</span>
              <strong>{dashboard.metrics.tickets}</strong>
              <small>Theo ngày đặt vé</small>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className={styles["metric-card"]}>
              <span>Suất chiếu hôm nay</span>
              <strong>{dashboard.metrics.showtimes}</strong>
              <small>Theo bảng LICHCHIEU</small>
            </div>
          </Col>
          <Col lg={3} md={6}>
            <div className={styles["metric-card"]}>
              <span>Tỉ lệ lấp đầy hôm nay</span>
              <strong>{dashboard.metrics.occupancy}%</strong>
              <small>Dựa trên ghế đã bán</small>
            </div>
          </Col>
        </Row>

        {dashboardStatus.loading ? (
          <Alert variant="info">Đang tải dữ liệu quản trị...</Alert>
        ) : (
          <Tabs defaultActiveKey="movies" className={styles["admin-tabs"]}>
            <Tab eventKey="movies" title="Phim">
              <div className={styles["toolbar"]}>
                <div>
                  <h2>Phim đang chiếu và sắp chiếu</h2>
                  <p>Danh sách lấy từ bảng PHIM và trạng thái tính theo ngày khởi chiếu.</p>
                </div>
                <Button>Thêm phim</Button>
              </div>
              <Table hover responsive className={styles["data-table"]}>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên phim</th>
                    <th>Trạng thái</th>
                    <th>Thể loại</th>
                    <th>Thời lượng</th>
                    <th>Ngày khởi chiếu</th>
                    <th>Lấp đầy</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((movie) => (
                    <tr key={movie.id}>
                      <td>{movie.id}</td>
                      <td>
                        <strong>{movie.title}</strong>
                        <span className={styles["sub-text"]}>
                          {movie.country || "Chưa cập nhật"} - {movie.showtimes} suất
                        </span>
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(movie.status)}>{movie.status}</Badge>
                      </td>
                      <td>{movie.genre}</td>
                      <td>{movie.duration} phút</td>
                      <td>{movie.releaseDate}</td>
                      <td>
                        <ProgressBar now={movie.occupancy} label={`${movie.occupancy}%`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="schedules" title="Lịch chiếu">
              <div className={styles["toolbar"]}>
                <div>
                  <h2>Lịch chiếu và phòng chiếu</h2>
                  <p>Dữ liệu join từ LICHCHIEU, PHIM, PHONGCHIEU và VE.</p>
                </div>
                <Button>Tạo suất chiếu</Button>
              </div>
              <Table hover responsive className={styles["data-table"]}>
                <thead>
                  <tr>
                    <th>Mã lịch</th>
                    <th>Phim</th>
                    <th>Phòng</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Định dạng</th>
                    <th>Giá vé</th>
                    <th>Ghế</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>{schedule.id}</td>
                      <td>{schedule.movie}</td>
                      <td>{schedule.room}</td>
                      <td>{schedule.date}</td>
                      <td>{schedule.time}</td>
                      <td>{schedule.format}</td>
                      <td>{formatCurrency(schedule.price)}</td>
                      <td>{schedule.seats}</td>
                      <td>
                        <Badge bg={getStatusVariant(schedule.status)}>{schedule.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="rooms" title="Phòng & ghế">
              <Row className={styles["room-layout"]}>
                <Col lg={5}>
                  <div className={styles["panel"]}>
                    <div className={styles["room-selector"]}>
                      <h2>Sơ đồ ghế</h2>
                      <Form.Select
                        value={selectedRoom?.id || ""}
                        onChange={(event) => setSelectedRoomId(Number(event.target.value))}
                      >
                        {dashboard.rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className={styles["screen"]}>Màn hình</div>
                    <div className={styles["seat-map"]}>
                      {roomSeats.map((seat) => {
                        const state = getSeatState(seat.status);

                        return (
                          <button
                            key={seat.id}
                            className={`${styles.seat} ${styles[state]}`}
                            type="button"
                            title={`${seat.name} - ${seat.type} - ${seat.status}`}
                          >
                            {seat.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className={styles["seat-legend"]}>
                      <span><i className={styles.available} /> Trống</span>
                      <span><i className={styles.held} /> Giữ chỗ/bảo trì</span>
                      <span><i className={styles.booked} /> Đã đặt</span>
                    </div>
                  </div>
                </Col>
                <Col lg={7}>
                  <Table hover responsive className={styles["data-table"]}>
                    <thead>
                      <tr>
                        <th>Phòng</th>
                        <th>Loại</th>
                        <th>Trạng thái</th>
                        <th>Tổng ghế</th>
                        <th>Đã cấu hình</th>
                        <th>Bảo trì</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.rooms.map((room) => (
                        <tr key={room.id}>
                          <td>{room.name}</td>
                          <td>{room.type}</td>
                          <td>{room.status}</td>
                          <td>{room.seats}</td>
                          <td>{room.active}</td>
                          <td>{room.maintenance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="tickets" title="Đặt vé">
              <div className={styles["toolbar"]}>
                <div>
                  <h2>Đặt vé online và tại quầy</h2>
                  <p>Danh sách lấy từ VE, kèm thông tin phim, phòng, ghế và khách hàng.</p>
                </div>
                <Button>Bán vé tại quầy</Button>
              </div>
              <Table hover responsive className={styles["data-table"]}>
                <thead>
                  <tr>
                    <th>Mã vé</th>
                    <th>Khách hàng</th>
                    <th>Kênh</th>
                    <th>Phim</th>
                    <th>Ghế</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.id}</td>
                      <td>{ticket.customer || "Khách tại quầy"}</td>
                      <td>{ticket.channel}</td>
                      <td>{ticket.movie}</td>
                      <td>{ticket.seats}</td>
                      <td>{ticket.bookedAt}</td>
                      <td>{formatCurrency(ticket.total)}</td>
                      <td>
                        <Badge bg={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="people" title="Khách hàng & nhân viên">
              <Table hover responsive className={styles["data-table"]}>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Họ tên</th>
                    <th>Nhóm/chức vụ</th>
                    <th>Liên hệ/tài khoản</th>
                    <th>Lượt vé</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.people.map((person) => (
                    <tr key={person.id}>
                      <td>{person.id}</td>
                      <td>{person.name}</td>
                      <td>{person.role}</td>
                      <td>{person.phone || person.email}</td>
                      <td>{person.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="reports" title="Doanh thu">
              <Row className={styles["report-grid"]}>
                <Col lg={4}>
                  <div className={styles["panel"]}>
                    <h2>Tổng quan doanh thu</h2>
                    <div className={styles["report-row"]}>
                      <span>Vé đã thanh toán</span>
                      <strong>{formatCurrency(dashboard.metrics.revenue)}</strong>
                    </div>
                    <ProgressBar now={100} />
                    <div className={styles["report-row"]}>
                      <span>Tỉ lệ lấp đầy hôm nay</span>
                      <strong>{dashboard.metrics.occupancy}%</strong>
                    </div>
                    <ProgressBar now={dashboard.metrics.occupancy} variant="warning" />
                  </div>
                </Col>
                <Col lg={8}>
                  <div className={styles["panel"]}>
                    <h2>Hiệu quả kinh doanh</h2>
                    <Table hover responsive className={styles["data-table"]}>
                      <thead>
                        <tr>
                          <th>Chỉ số</th>
                          <th>Giá trị</th>
                          <th>Nguồn dữ liệu</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Doanh thu đã thanh toán</td>
                          <td>{formatCurrency(dashboard.metrics.revenue)}</td>
                          <td>VE.TrangThaiThanhToan</td>
                        </tr>
                        <tr>
                          <td>Vé đặt hôm nay</td>
                          <td>{dashboard.metrics.tickets}</td>
                          <td>VE.NgayDat</td>
                        </tr>
                        <tr>
                          <td>Suất chiếu hôm nay</td>
                          <td>{dashboard.metrics.showtimes}</td>
                          <td>LICHCHIEU.NgayChieu</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        )}
      </Container>
    </div>
  );
}

export default AdminPage;
