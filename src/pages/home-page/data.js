// 1. Import các file ảnh (đi lùi 3 cấp: home-page -> pages -> src, rồi vào assets)
import carousel1 from "../../../src/assets/images/carousel1.png";
import carousel2 from "../../../src/assets/images/carousel2.jpg";
import carousel3 from "../../../src/assets/images/carousel3.jpg";
import carousel4 from "../../../src/assets/images/carousel4.jpg";

// 2. Sử dụng biến đã import vào mảng dữ liệu
export const CarouselData = [
  {
    id: "1",
    image: carousel1,
  },
  {
    id: "2",
    image: carousel2,
  },
  {
    id: "3",
    image: carousel3,
  },
  {
    id: "4",
    image: carousel4,
  },
];
