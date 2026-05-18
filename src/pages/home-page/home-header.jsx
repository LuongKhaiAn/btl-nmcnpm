import { useState } from "react";
import { Avatar, Dropdown } from "antd";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import logo from "../../assets/images/logo.svg";
import { getCurrentUser, logout } from "../../utils/auth";

const HomeHeader = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate("/");
  };

  const menuItems = [
    currentUser?.role === "admin"
      ? {
        key: "admin",
        label: "Trang quản lý",
        onClick: () => navigate("/admin"),
      }
      : {
        key: "account",
        label: "Tài khoản",
        onClick: () => navigate("/account"),
      },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Navbar expand="lg" className={styles["site-header"]}>
      <Container fluid className={styles["header-inner"]}>
        <Navbar.Brand as={Link} to="/" className={styles["brand-link"]}>
          <img src={logo} className={styles["nav-logo"]} alt="cinemaX" />
          <span>cinemaX</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="cinemax-nav" />
        <Navbar.Collapse id="cinemax-nav">
          <Nav className={styles["main-nav"]}>
            <Nav.Link as={NavLink} to="/">
              Trang chủ
            </Nav.Link>
            <Nav.Link as={NavLink} to="/booking">
              Đặt vé
            </Nav.Link>
            <Nav.Link as={NavLink} to="/account">
              Tài khoản
            </Nav.Link>
          </Nav>
          <div className={styles["header-actions"]}>
            {currentUser ? (
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <button className={styles["login-status"]} type="button">
                  <Avatar className={styles["user-avatar"]}>
                    {currentUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <span>{currentUser.username}</span>
                </button>
              </Dropdown>
            ) : (
              <Button href="/login">Đăng nhập</Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HomeHeader;
