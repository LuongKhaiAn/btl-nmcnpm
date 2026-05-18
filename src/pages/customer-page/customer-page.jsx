import { useEffect, useState } from "react";
import { Alert, Badge, Button, Col, Container, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";
import Footer from "../home-page/footer";
import HomeHeader from "../home-page/home-header";
import { getCurrentUser } from "../../utils/auth";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function CustomerPage() {
  const currentUser = getCurrentUser();
  const [account, setAccount] = useState({
    customer: null,
    tickets: [],
    stats: { ticketCount: 0, totalSpent: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      if (!currentUser?.customerId) {
        setMessage("Vui lòng đăng nhập bằng tài khoản khách hàng để xem thông tin tài khoản.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/customer/account?customerId=${currentUser.customerId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải thông tin khách hàng.");
        }

        setAccount(data);
      } catch (error) {
        setMessage(error.message || "Không thể tải thông tin khách hàng.");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [currentUser?.customerId]);

  return (
    <>
      <HomeHeader />
      <main className={styles["account-page"]}>
        <Container>
          <div className={styles["page-heading"]}>
            <span>Tài khoản khách hàng</span>
            <h1>Thông tin cá nhân và lịch sử đặt vé</h1>
            <p>Theo dõi hồ sơ, vé đã đặt và trạng thái thanh toán tại cinemaX.</p>
          </div>

          {message && <Alert variant="warning">{message}</Alert>}
          {loading ? (
            <Alert variant="info">Đang tải tài khoản khách hàng...</Alert>
          ) : (
            <Row className="g-4">
              <Col lg={4}>
                <section className={styles["profile-card"]}>
                  <div className={styles["avatar"]}>
                    {account.customer?.name?.charAt(0) || "C"}
                  </div>
                  <h2>{account.customer?.name}</h2>
                  <p>{account.customer?.email}</p>
                  <div className={styles["profile-row"]}>
                    <span>Mã khách hàng</span>
                    <strong>KH{account.customer?.id}</strong>
                  </div>
                  <div className={styles["profile-row"]}>
                    <span>Số điện thoại</span>
                    <strong>{account.customer?.phone}</strong>
                  </div>
                  <Button as={Link} to="/booking" className="w-100">
                    Đặt vé mới
                  </Button>
                </section>
              </Col>

              <Col lg={8}>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <div className={styles["stat-card"]}>
                      <span>Tổng vé đã đặt</span>
                      <strong>{account.stats.ticketCount}</strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles["stat-card"]}>
                      <span>Tổng chi tiêu</span>
                      <strong>{formatCurrency(account.stats.totalSpent)}</strong>
                    </div>
                  </Col>
                </Row>

                <section className={styles["history-panel"]}>
                  <div className={styles["panel-heading"]}>
                    <h2>Lịch sử vé</h2>
                    <Badge bg="dark">{account.tickets.length} vé</Badge>
                  </div>
                  <Table hover responsive className={styles["ticket-table"]}>
                    <thead>
                      <tr>
                        <th>Mã vé</th>
                        <th>Phim</th>
                        <th>Suất chiếu</th>
                        <th>Ghế</th>
                        <th>Giá vé</th>
                        <th>Thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>VE{ticket.id}</td>
                          <td>{ticket.movie}</td>
                          <td>{ticket.date} {ticket.time}</td>
                          <td>{ticket.seat}</td>
                          <td>{formatCurrency(ticket.price)}</td>
                          <td>
                            <Badge bg={ticket.paymentStatus === "Đã thanh toán" ? "success" : "warning"}>
                              {ticket.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </section>
              </Col>
            </Row>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default CustomerPage;
