import { Col, Nav, NavLink, Row, Table } from "react-bootstrap";

function Bai2(){
  return(
    <div>
      <Row>
        <Col md="3">
          <Nav className="flex-columm">
            <NavLink href="iphone">iphone</NavLink>
            <NavLink href="samsung">samsung</NavLink>
            <NavLink href="aaa">aaa</NavLink>
          </Nav>
        </Col>
        <Col>
          <Table variant="primary" bordered striped hover>
            <thead>
              <tr>
                <th>ho ten</th>
                <th>msv</th>
                <th>tuoi</th>
              </tr>
              <tr>
                <th>aaaa</th>
                <th>abc123</th>
                <th>12</th>
              </tr>
              <tr>
                <th>bbbbb</th>
                <th>bnv1123</th>
                <th>18</th>
              </tr>
            </thead>

          </Table>
        </Col>
      </Row>
    </div>
  );
}

export default Bai2;
