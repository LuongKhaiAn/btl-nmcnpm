import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import styles from "./styles.module.scss";
import Footer from "../home-page/footer";
import HomeHeader from "../home-page/home-header";

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getSeatState(seat, bookedSeatIds) {
  if (bookedSeatIds.has(seat.id) || seat.status.includes("Đã")) {
    return "booked";
  }

  if (seat.status.includes("Bảo trì") || seat.status.includes("Giữ")) {
    return "held";
  }

  return "available";
}

function BookingPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ movies: [], schedules: [], seats: [], bookedSeats: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState(searchParams.get("movieId") || "");
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/booking/options");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Không thể tải dữ liệu đặt vé.");
        }

        setData(result);

        const firstMovieId = searchParams.get("movieId") || result.movies?.[0]?.id?.toString() || "";
        setSelectedMovieId(firstMovieId);
      } catch (error) {
        setMessage(error.message || "Không thể tải dữ liệu đặt vé.");
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [searchParams]);

  const schedulesByMovie = useMemo(
    () => data.schedules.filter((schedule) => schedule.movieId.toString() === selectedMovieId),
    [data.schedules, selectedMovieId],
  );

  useEffect(() => {
    setSelectedScheduleId(schedulesByMovie[0]?.id?.toString() || "");
    setSelectedSeatId("");
  }, [schedulesByMovie]);

  const selectedSchedule = useMemo(
    () => data.schedules.find((schedule) => schedule.id.toString() === selectedScheduleId),
    [data.schedules, selectedScheduleId],
  );

  const bookedSeatIds = useMemo(
    () =>
      new Set(
        data.bookedSeats
          .filter((seat) => seat.scheduleId.toString() === selectedScheduleId)
          .map((seat) => seat.seatId),
      ),
    [data.bookedSeats, selectedScheduleId],
  );

  const roomSeats = useMemo(
    () => data.seats.filter((seat) => seat.roomId === selectedSchedule?.roomId),
    [data.seats, selectedSchedule],
  );

  const selectedMovie = useMemo(
    () => data.movies.find((movie) => movie.id.toString() === selectedMovieId),
    [data.movies, selectedMovieId],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: Number(selectedScheduleId),
          seatId: Number(selectedSeatId),
          ...form,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể đặt vé.");
      }

      setMessage(`Đặt vé thành công. Mã vé: ${result.ticketId}`);
      setSelectedSeatId("");
    } catch (error) {
      setMessage(error.message || "Không thể đặt vé.");
    }
  };

  return (
    <>
      <HomeHeader />
      <main className={styles["booking-page"]}>
        <Container>
          <div className={styles["page-heading"]}>
            <span>Đặt vé</span>
            <h1>Chọn phim, suất chiếu và ghế ngồi</h1>
            <p>Dữ liệu phim, lịch chiếu và ghế được tải trực tiếp từ database cinemaX.</p>
          </div>

          {message && (
            <Alert variant={message.includes("thành công") ? "success" : "warning"}>
              {message}
            </Alert>
          )}

          {loading ? (
            <Alert variant="info">Đang tải dữ liệu đặt vé...</Alert>
          ) : (
            <Row className="g-4">
              <Col lg={8}>
                <section className={styles["booking-panel"]}>
                  <h2>Thông tin suất chiếu</h2>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Phim</Form.Label>
                      <Form.Select
                        value={selectedMovieId}
                        onChange={(event) => setSelectedMovieId(event.target.value)}
                      >
                        {data.movies.map((movie) => (
                          <option key={movie.id} value={movie.id}>
                            {movie.title}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Suất chiếu</Form.Label>
                      <Form.Select
                        value={selectedScheduleId}
                        onChange={(event) => {
                          setSelectedScheduleId(event.target.value);
                          setSelectedSeatId("");
                        }}
                      >
                        {schedulesByMovie.map((schedule) => (
                          <option key={schedule.id} value={schedule.id}>
                            {schedule.date} - {schedule.time} - {schedule.room}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  <div className={styles["movie-summary"]}>
                    <div>
                      <Badge bg="danger">{selectedMovie?.status || "Đang chiếu"}</Badge>
                      <h3>{selectedMovie?.title || "Chọn phim"}</h3>
                      <p>{selectedMovie?.genre} - {selectedMovie?.duration} phút</p>
                    </div>
                    <strong>{formatCurrency(selectedSchedule?.price)}</strong>
                  </div>

                  <h2>Chọn ghế</h2>
                  <div className={styles["screen"]}>Màn hình</div>
                  <div className={styles["seat-map"]}>
                    {roomSeats.map((seat) => {
                      const state = getSeatState(seat, bookedSeatIds);
                      const isDisabled = state !== "available";

                      return (
                        <button
                          key={seat.id}
                          className={`${styles.seat} ${styles[state]} ${
                            selectedSeatId === seat.id.toString() ? styles.selected : ""
                          }`}
                          disabled={isDisabled}
                          onClick={() => setSelectedSeatId(seat.id.toString())}
                          type="button"
                        >
                          {seat.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </Col>

              <Col lg={4}>
                <Form className={styles["booking-panel"]} onSubmit={handleSubmit}>
                  <h2>Thông tin khách hàng</h2>
                  <Form.Group className="mb-3">
                    <Form.Label>Họ tên</Form.Label>
                    <Form.Control
                      value={form.customerName}
                      onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                  </Form.Group>

                  <div className={styles["order-summary"]}>
                    <span>Phim</span>
                    <strong>{selectedMovie?.title || "-"}</strong>
                    <span>Suất chiếu</span>
                    <strong>{selectedSchedule ? `${selectedSchedule.date} ${selectedSchedule.time}` : "-"}</strong>
                    <span>Ghế</span>
                    <strong>{roomSeats.find((seat) => seat.id.toString() === selectedSeatId)?.name || "-"}</strong>
                    <span>Tạm tính</span>
                    <strong>{formatCurrency(selectedSchedule?.price)}</strong>
                  </div>

                  <Button className="w-100" disabled={!selectedScheduleId || !selectedSeatId} type="submit">
                    Xác nhận đặt vé
                  </Button>
                </Form>
              </Col>
            </Row>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

export default BookingPage;
