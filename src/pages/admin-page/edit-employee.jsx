import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

function EditEmployeeModal({ show, onHide, employee, onSuccess }) {
  const [formData, setFormData] = useState({
    hoTen: "",
    chucVu: "",
    taiKhoan: "",
    matKhau: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      return;
    }

    setFormData({
      hoTen: employee?.name || "",
      chucVu: employee?.role || "",
      taiKhoan: employee?.username || "",
      matKhau: "",
    });
    setError("");
  }, [employee, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.hoTen || !formData.chucVu || !formData.taiKhoan) {
      setError("Vui lòng nhập họ tên, chức vụ và tài khoản.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật nhân viên.");
      }

      onHide();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sửa nhân viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên *</Form.Label>
            <Form.Control name="hoTen" value={formData.hoTen} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Chức vụ *</Form.Label>
            <Form.Control name="chucVu" value={formData.chucVu} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tài khoản *</Form.Label>
            <Form.Control name="taiKhoan" value={formData.taiKhoan} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              placeholder="Để trống nếu không đổi"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Hủy</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditEmployeeModal;
