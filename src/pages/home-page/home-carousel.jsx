import { Carousel, Image } from "antd";
import { Container } from "react-bootstrap";
import { CarouselData } from "./data";
import styles from "./styles.module.scss";

function HomeCarousel() {
  return (
    <Container className={styles["home-carousel"]}>
      <Carousel height={400} autoplay={{ dotDuration: true }} autoplaySpeed={5000}>
        {CarouselData?.map ((c) => (
          <div key={c.id}>
            <Image src={c.image} />
          </div>
        ))}
      </Carousel>
    </Container>
  );
}

export default HomeCarousel;
