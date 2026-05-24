import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

function AddMovieModal({ show, onHide, onSuccess }) {
  const [formData, setFormData] = useState({
    tenPhim: "",
    theLoai: "",
    thoiLuong: "",
    daoDien: "",
    dienVien: "",
    quocGia: "",
    ngayKhoiChieu: "",
    noiDung: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.tenPhim || !formData.theLoai || !formData.thoiLuong || !formData.ngayKhoiChieu) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể thêm phim.");
      }

      setSuccess("Thêm phim thành công!");
      setFormData({
        tenPhim: "",
        theLoai: "",
        thoiLuong: "",
        daoDien: "",
        dienVien: "",
        quocGia: "",
        ngayKhoiChieu: "",
        noiDung: "",
      });

      setTimeout(() => {
        onHide();
        onSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm phim mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên phim *</Form.Label>
            <Form.Control
              type="text"
              name="tenPhim"
              value={formData.tenPhim}
              onChange={handleChange}
              placeholder="VD: Avatar 3"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thể loại *</Form.Label>
            <Form.Control
              type="text"
              name="theLoai"
              value={formData.theLoai}
              onChange={handleChange}
              placeholder="VD: Khoa học viễn tưởng"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thời lượng (phút) *</Form.Label>
            <Form.Control
              type="number"
              name="thoiLuong"
              value={formData.thoiLuong}
              onChange={handleChange}
              placeholder="VD: 120"
              min="1"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Đạo diễn</Form.Label>
            <Form.Control
              type="text"
              name="daoDien"
              value={formData.daoDien}
              onChange={handleChange}
              placeholder="VD: James Cameron"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Diễn viên</Form.Label>
            <Form.Control
              type="text"
              name="dienVien"
              value={formData.dienVien}
              onChange={handleChange}
              placeholder="VD: Sam Worthington, Zoe Saldana"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quốc gia</Form.Label>
            <Form.Control
              type="text"
              name="quocGia"
              value={formData.quocGia}
              onChange={handleChange}
              placeholder="VD: Mỹ"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày khởi chiếu *</Form.Label>
            <Form.Control
              type="date"
              name="ngayKhoiChieu"
              value={formData.ngayKhoiChieu}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              name="noiDung"
              value={formData.noiDung}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả nội dung phim..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang thêm..." : "Thêm phim"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddMovieModal;
