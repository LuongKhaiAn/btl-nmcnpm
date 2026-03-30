import anh from "../images/double-helix-svgrepo-com.svg";

function Gallery(){
  return (
    <div>
      <h2>Gallery</h2>
      <Profile/>
      <hr/>
      <Profile2/>
    </div>
  );
}

export const Profile = () =>{
  return (
    <div>
      <img src="images/book1.png" alt=""></img>
    </div>
  );
};

export const Profile2 = () => {
  return (
    <div>
      <img src="images/book2.png" alt=""></img>
      <img src={anh} alt="" height={100} width={100}></img>
    </div>
  );
};

export default Gallery;
