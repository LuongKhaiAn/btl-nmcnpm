import { useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";

function CreateScheduleModal({ show, onHide, movies, rooms, onSuccess }) {
  const [formData, setFormData] = useState({
    maPhim: "",
    maPhong: "",
    ngayChieu: "",
    gioChieu: "",
    giaVe: "",
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

    if (
      !formData.maPhim ||
      !formData.maPhong ||
      !formData.ngayChieu ||
      !formData.gioChieu ||
      !formData.giaVe
    ) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maPhim: Number(formData.maPhim),
          maPhong: Number(formData.maPhong),
          ngayChieu: formData.ngayChieu,
          gioChieu: formData.gioChieu,
          giaVe: Number(formData.giaVe),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo suất chiếu.");
      }

      setSuccess("Tạo suất chiếu thành công!");
      setFormData({
        maPhim: "",
        maPhong: "",
        ngayChieu: "",
        gioChieu: "",
        giaVe: "",
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
        <Modal.Title>Tạo suất chiếu mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Chọn phim *</Form.Label>
            <Form.Select
              name="maPhim"
              value={formData.maPhim}
              onChange={handleChange}
            >
              <option value="">-- Chọn phim --</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Chọn phòng chiếu *</Form.Label>
            <Form.Select
              name="maPhong"
              value={formData.maPhong}
              onChange={handleChange}
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.type})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày chiếu *</Form.Label>
            <Form.Control
              type="date"
              name="ngayChieu"
              value={formData.ngayChieu}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giờ chiếu *</Form.Label>
            <Form.Control
              type="time"
              name="gioChieu"
              value={formData.gioChieu}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Giá vé (VND) *</Form.Label>
            <Form.Control
              type="number"
              name="giaVe"
              value={formData.giaVe}
              onChange={handleChange}
              placeholder="VD: 150000"
              min="0"
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
          {loading ? "Đang tạo..." : "Tạo suất chiếu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateScheduleModal;
