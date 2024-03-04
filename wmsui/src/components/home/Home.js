import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import img4 from './wmsimg.webp';

import "./Home.css"


const Home=()=>{
    return(
        <div>
            <Container>
            <br></br>
            <Row className= "mt-1">
                <h3>
                       <b> <p color='red'>WELCOME TO WAREHOUSE</p></b>
                </h3>
            </Row>
            
            <Row>
            <img height={800}
            
                    src={img4}

                    alt="1st slide"
                    />
            </Row>
            </Container>
          
        </div>
        
        )
}

export default Home;