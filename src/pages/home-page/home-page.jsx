import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import HomeHeader from "./home-header";
import Footer from "./footer";
import styles from "./styles.module.scss";
import carousel1 from "../../assets/images/carousel1.png";
import carousel2 from "../../assets/images/carousel2.jpg";
import carousel4 from "../../assets/images/carousel4.jpg";

const fallbackMovies = [
  {
    id: 1,
    title: "Lật Mặt 7",
    genre: "Hành động",
    duration: 120,
    status: "Đang chiếu",
    releaseDate: "2024-04-26",
  },
  {
    id: 2,
    title: "Mai",
    genre: "Tình cảm",
    duration: 130,
    status: "Đang chiếu",
    releaseDate: "2024-02-10",
  },
  {
    id: 10,
    title: "Inside Out 2",
    genre: "Hoạt hình",
    duration: 100,
    status: "Đang chiếu",
    releaseDate: "2024-06-14",
  },
];

function HomePage() {
  const [movies, setMovies] = useState(fallbackMovies);

  useEffect(() => {
    async function loadMovies() {
      try {
        const response = await fetch("/api/booking/options");
        const data = await response.json();

        if (response.ok && data.movies?.length) {
          setMovies(data.movies);
        }
      } catch {
        setMovies(fallbackMovies);
      }
    }

    loadMovies();
  }, []);

  const featuredMovies = useMemo(() => movies.slice(0, 6), [movies]);

  return (
    <>
      <HomeHeader />
      <main className={styles["landing-page"]}>
        <section className={styles["hero"]} style={{ backgroundImage: `url(${carousel4})` }}>
          <Container className={styles["hero-content"]}>
            <Badge bg="danger">cinemaX</Badge>
            <h1>Đặt vé xem phim nhanh, chọn ghế trực quan</h1>
            <p>
              Theo dõi phim đang chiếu, suất chiếu còn ghế và quản lý vé của bạn
              ngay trên hệ thống cinemaX.
            </p>
            <div className={styles["hero-actions"]}>
              <Button as={Link} to="/booking" size="lg">
                Đặt vé ngay
              </Button>
              <Button as={Link} to="/account" size="lg" variant="outline-light">
                Tài khoản của tôi
              </Button>
            </div>
          </Container>
        </section>

        <Container className={styles["landing-section"]}>
          <div className={styles["section-heading"]}>
            <div>
              <span>Đang chiếu</span>
              <h2>Phim nổi bật tại cinemaX</h2>
            </div>
            <Button as={Link} to="/booking" variant="outline-danger">
              Xem lịch chiếu
            </Button>
          </div>

          <Row className={styles["movie-grid"]}>
            {featuredMovies.map((movie, index) => (
              <Col lg={4} md={6} key={movie.id}>
                <article className={styles["movie-card"]}>
                  <img
                    src={index % 2 === 0 ? carousel1 : carousel2}
                    alt={movie.title}
                  />
                  <div>
                    <Badge bg={movie.status === "Sắp chiếu" ? "warning" : "success"}>
                      {movie.status}
                    </Badge>
                    <h3>{movie.title}</h3>
                    <p>{movie.genre} - {movie.duration} phút</p>
                    <Button as={Link} to={`/booking?movieId=${movie.id}`} variant="dark">
                      Chọn suất chiếu
                    </Button>
                  </div>
                </article>
              </Col>
            ))}
          </Row>
        </Container>

        <section className={styles["experience-band"]}>
          <Container>
            <Row className="g-4">
              <Col md={4}>
                <div className={styles["feature-item"]}>
                  <strong>01</strong>
                  <h3>Chọn phim và suất chiếu</h3>
                  <p>Dữ liệu được đồng bộ từ lịch chiếu trong hệ thống quản lý.</p>
                </div>
              </Col>
              <Col md={4}>
                <div className={styles["feature-item"]}>
                  <strong>02</strong>
                  <h3>Chọn ghế theo phòng</h3>
                  <p>Ghế trống, đã đặt và đang giữ chỗ được hiển thị rõ ràng.</p>
                </div>
              </Col>
              <Col md={4}>
                <div className={styles["feature-item"]}>
                  <strong>03</strong>
                  <h3>Quản lý vé cá nhân</h3>
                  <p>Khách hàng xem lại vé, trạng thái thanh toán và lịch sử đặt.</p>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default HomePage;
