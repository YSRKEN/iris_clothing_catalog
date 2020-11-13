import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const APPLICATION_TITLE = 'めーおーの聖装カタログ';

const Title: React.FC = () => (<>
  <h1 className="d-none d-sm-inline">{APPLICATION_TITLE}</h1>
  <h3 className="d-inline d-sm-none">{APPLICATION_TITLE}</h3>
</>);

const App: React.FC = () => {
  return (
    <Container>
      <Row className="my-3">
        <Col className="text-center">
          <Title />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
