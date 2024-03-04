import Profile from "../components/profile/Profile";
import { Nav } from "react-bootstrap";
import { Link, Route, Routes } from "react-router-dom";

const ProfileNavBar=()=>{
return(
    <div>
    <Nav fill variant="tabs" defaultActiveKey="/home">
      <Nav.Item>
        <Nav.Link as={Link} to="/profile">Personal information</Nav.Link>
      </Nav.Item>
      
    </Nav>
    <Routes>
        <Route exact path="/" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
    </Routes>
    
    </div>
);
};

export default ProfileNavBar;