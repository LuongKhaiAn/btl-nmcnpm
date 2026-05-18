import { useState } from "react";
import { Avatar, Dropdown } from "antd";
import { Button, Col, Form, Nav, Navbar, NavLink, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

  const adminMenuItems = [
    {
      key: "admin",
      label: "Trang quản lý",
      onClick: () => navigate("/admin"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <div>
      <Navbar bg="light">
        <Navbar.Brand href="/" className="col-2">
          <img src={logo} className={styles["nav-logo"]} alt="Logo" />
        </Navbar.Brand>
        <Nav className="flex-row col-7 justify-content-center">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/product">Product</NavLink>
          <NavLink href="/about-us">About us</NavLink>
        </Nav>
        <Form className="col-3">
          <Row>
            <Col className="col-5">
              <Form.Control
                type="search"
              >
              </Form.Control>
            </Col>
            <Col className="col-77 d-flex gap-2">
              {currentUser?.role === "admin" ? (
                <Dropdown menu={{ items: adminMenuItems }} placement="bottomRight">
                  <div className={styles["login-status"]}>
                    <Avatar className={styles["admin-avatar"]}>
                      {currentUser.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <span>{currentUser.username}</span>
                  </div>
                </Dropdown>
              ) : (
                <Button className="" href="/login">
                  Đăng nhập
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Navbar>
    </div>
  );
};

export default HomeHeader;
