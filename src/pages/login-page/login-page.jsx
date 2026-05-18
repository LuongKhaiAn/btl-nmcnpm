import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import { login } from "../../utils/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const user = login(username.trim(), password);

    if (!user) {
      setError("Tài khoản hoặc mật khẩu không đúng.");
      return;
    }

    navigate(user.role === "admin" ? "/admin" : "/");
  };

  return (
    <Container className={styles["login-page"]}>
      <Card className={styles["login-card"]}>
        <Card.Body>
          <h1 className={styles["login-title"]}>Đăng nhập</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Tài khoản</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nhập tài khoản"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100">
              Đăng nhập
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
