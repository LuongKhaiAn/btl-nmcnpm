import { Nav, Navbar, NavLink, Form, Button, Col, Row} from "react-bootstrap";
import styles from "./styles.module.scss";
import logo from "../../assets/images/logo.svg";

const HomeNav = () => {
  return (
    <div>
      <Navbar bg="light">
        <Navbar.Brand href="#home" className="col-2">
          <img src={logo} className={styles["nav-logo"]} alt="Logo" />
        </Navbar.Brand>
        <Nav className="flex-row col-6 justify-content-center">
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#product">Product</NavLink>
          <NavLink href="#about-us">About us</NavLink>
        </Nav>
        <Form className="col-4">
          <Row>
            <Col className="col-8">
              <Form.Control
                type="search"
              >
              </Form.Control>
            </Col>
            <Col className="col-4">
              <Button>Đăng nhập</Button>
            </Col>
          </Row>
        </Form>
      </Navbar>
    </div>
  );
};

export default HomeNav;
