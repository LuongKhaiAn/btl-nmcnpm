import { Container } from "react-bootstrap";
import styles from "./styles.module.scss";

function Footer() {
  return (
    <footer className={styles["site-footer"]}>
      <Container className={styles["footer-inner"]}>
        <div>
          <strong>cinemaX</strong>
          <p>Hệ thống đặt vé và quản lý rạp chiếu phim.</p>
        </div>
        <span>© 2026 cinemaX. All rights reserved.</span>
      </Container>
    </footer>
  );
}

export default Footer;
