import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

function EditCustomerModal({ show, onHide, customer, onSuccess }) {
  const [formData, setFormData] = useState({
    hoTen: "",
    soDienThoai: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) {
      return;
    }

    setFormData({
      hoTen: customer?.name || "",
      soDienThoai: customer?.phone || "",
      email: customer?.email || "",
    });
    setError("");
  }, [customer, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.hoTen || !formData.soDienThoai) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật khách hàng.");
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
        <Modal.Title>Sửa khách hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên *</Form.Label>
            <Form.Control name="hoTen" value={formData.hoTen} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Số điện thoại *</Form.Label>
            <Form.Control name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
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

export default EditCustomerModal;
