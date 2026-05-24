import { useMemo, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import styles from "./styles.module.scss";

function CounterTicketModal({ show, onHide, schedules, seats, onSuccess }) {
  const [formData, setFormData] = useState({
    maLichChieu: "",
    maGhe: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedSchedule = useMemo(
    () => schedules.find((s) => s.id === Number(formData.maLichChieu)),
    [formData.maLichChieu, schedules],
  );

  const availableSeats = useMemo(() => {
    if (!selectedSchedule) return [];

    return seats.filter((seat) => seat.roomId === selectedSchedule.roomId);
  }, [selectedSchedule, seats]);

  const handleScheduleChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, maLichChieu: value, maGhe: "" }));
  };

  const handleSeatClick = (seatId) => {
    setFormData((prev) => ({ ...prev, maGhe: String(seatId) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.maLichChieu || !formData.maGhe) {
      setError("Vui lòng chọn suất chiếu và ghế.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maLichChieu: Number(formData.maLichChieu),
          maGhe: Number(formData.maGhe),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo vé.");
      }

      setSuccess("Bán vé tại quầy thành công!");
      setFormData({ maLichChieu: "", maGhe: "" });

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
        <Modal.Title>Bán vé tại quầy</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Chọn suất chiếu *</Form.Label>
            <Form.Select
              value={formData.maLichChieu}
              onChange={handleScheduleChange}
            >
              <option value="">-- Chọn suất chiếu --</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.movie} - {schedule.date} {schedule.time} (
                  {schedule.room})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedSchedule && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Thông tin suất chiếu</Form.Label>
                <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "6px" }}>
                  <p className="mb-1">
                    <strong>Phim:</strong> {selectedSchedule.movie}
                  </p>
                  <p className="mb-1">
                    <strong>Ngày giờ:</strong> {selectedSchedule.date} {selectedSchedule.time}
                  </p>
                  <p className="mb-1">
                    <strong>Phòng:</strong> {selectedSchedule.room}
                  </p>
                  <p className="mb-0">
                    <strong>Giá vé:</strong> {Number(selectedSchedule.price).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Chọn ghế *</Form.Label>
                <div className={styles["seat-map"]}>
                  {availableSeats.map((seat) => (
                    <button
                      key={seat.id}
                      type="button"
                      className={`${styles.seat} ${
                        seat.status === "Đã đặt"
                          ? styles.booked
                          : seat.status.includes("Giữ")
                            ? styles.held
                            : formData.maGhe === String(seat.id)
                              ? styles.selected
                              : styles.available
                      }`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === "Đã đặt" || seat.status.includes("Giữ")}
                    >
                      {seat.name}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "12px", fontSize: "13px", color: "#657086" }}>
                  <div>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", background: "#f8fafc", border: "1px solid #ccd4df", marginRight: "6px" }}></span>
                    Trống
                  </div>
                  <div>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", background: "#fff3cd", border: "1px solid #ccd4df", marginRight: "6px" }}></span>
                    Giữ chỗ/bảo trì
                  </div>
                  <div>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", background: "#d1e7dd", border: "1px solid #ccd4df", marginRight: "6px" }}></span>
                    Đã đặt
                  </div>
                </div>
              </Form.Group>

              {formData.maGhe && (
                <Alert variant="info">
                  Ghế đã chọn: <strong>{availableSeats.find(s => s.id === Number(formData.maGhe))?.name}</strong>
                </Alert>
              )}
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !formData.maLichChieu || !formData.maGhe}
        >
          {loading ? "Đang bán..." : "Xác nhận bán vé"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CounterTicketModal;
