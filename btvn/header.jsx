import { Navbar, Nav, NavLink, Form, Button, Row, Col } from "react-bootstrap";
import logo from "../logo.svg";

function Header() {
  return (
    <div>
      <Navbar bg="light">
        <Navbar.Brand href="Home">
          <img src={logo} height={50} width={50}></img>
        </Navbar.Brand>
        <Nav className="flex-row">
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#product">Product</NavLink>
          <NavLink href="#about-us">About us</NavLink>
        </Nav>
        <Form className="inline">
          <Row>
            <Col>
              <Form.Control
                type="search"
                placeholder="ten va gia"
                id="txtSearch"
                name="txtSearch"
                style={{width:200}}
              />
            </Col>
            <Col>
              <Button variant="online-success">Search</Button>
            </Col>
          </Row>
        </Form>
      </Navbar>
    </div>
  );
}

export default Header;
