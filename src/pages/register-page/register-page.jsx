import { useState } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import { login } from "../../utils/auth";

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Vui lòng nhập họ tên.");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return false;
    }
    if (!form.email.trim()) {
      setError("Vui lòng nhập email.");
      return false;
    }
    if (!form.password) {
      setError("Vui lòng nhập mật khẩu.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(form.phone.replace(/\D/g, ""))) {
      setError("Số điện thoại không hợp lệ (ít nhất 10 chữ số).");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/customer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Đăng ký tài khoản thất bại.");
      }

      // Auto login after successful registration
      const loginResponse = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.phone.trim(),
          password: form.password,
        }),
      });

      if (loginResponse.ok) {
        await login(form.phone.trim(), form.password);
        navigate("/booking");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Đăng ký tài khoản thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles["register-page"]}>
      <Card className={styles["register-card"]}>
        <Card.Body>
          <h1 className={styles["register-title"]}>Đăng ký tài khoản</h1>
          <p className={styles["register-hint"]}>
            Tạo tài khoản để đặt vé nhanh chóng và dễ dàng.
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ tên của bạn"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </Form>

          <p className={styles["login-link"]}>
            Đã có tài khoản? <Link to="/login">Đăng nhập tại đây</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegisterPage;
