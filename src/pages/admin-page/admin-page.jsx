import { Button, Container, Navbar, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import { logout } from "../../utils/auth";

function AdminPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="light" className={styles["admin-header"]}>
        <Navbar.Brand>Trang quản lý</Navbar.Brand>
        <Button variant="outline-secondary" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Navbar>

      <Container className={styles["admin-page"]}>
        <h1>Quản lý hệ thống</h1>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Chức năng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Quản lý sản phẩm</td>
              <td>Sẵn sàng</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Quản lý người dùng</td>
              <td>Sẵn sàng</td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default AdminPage;
