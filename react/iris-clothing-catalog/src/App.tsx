import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';

const APPLICATION_TITLE = 'めーおーの聖装カタログ';

interface IrisClothing {
  index: number;
  reality: string;
  nickname: string;
  iris_name: string;
  type: string;
  hp: number;
  attack: number;
  defence: number;
  magic: number;
  speed: number;
  lucky: number;
  evade: number;
  counter: number;
  death: number;
};


const Title: React.FC = () => (<>
  <h1 className="d-none d-sm-inline">{APPLICATION_TITLE}</h1>
  <h3 className="d-inline d-sm-none">{APPLICATION_TITLE}</h3>
</>);

const App: React.FC = () => {
  const [clothingList, setClothingList] = useState<IrisClothing[]>([]);

  useEffect(() => {
    fetch('./list.json').then(res => {
      if (res.ok) {
        res.json().then(data => {
          setClothingList(data.map((d: IrisClothing, i: number) => {
            return { ...d, index: i + 1 };
          }));
        });
      }
    });
  }, []);

  useEffect(() => console.log(clothingList), [clothingList]);

  return (
    <Container>
      <Row className="my-3">
        <Col className="text-center">
          <Title />
        </Col>
      </Row>
      <Row className="my-3">
        <Col className="text-center">
          <Table size="sm" striped>
            <thead>
              <tr>
                <th>#</th>
                <th>レアリティ</th>
                <th>二つ名</th>
                <th>名前</th>
                <th>属性</th>
                <th>HP</th>
                <th>攻撃</th>
                <th>防御</th>
                <th>魔力</th>
                <th>敏捷</th>
                <th>幸運</th>
                <th>回避率</th>
                <th>反撃率</th>
                <th>即死率</th>
              </tr>
            </thead>
            <tbody>
              {clothingList.map(clothing => <tr key={clothing.index}>
                <td>{clothing.index}</td>
                <td>{clothing.reality}</td>
                <td>{clothing.nickname}</td>
                <td>{clothing.iris_name}</td>
                <td>{clothing.type}</td>
                <td>{clothing.hp}</td>
                <td>{clothing.attack}</td>
                <td>{clothing.defence}</td>
                <td>{clothing.magic}</td>
                <td>{clothing.speed}</td>
                <td>{clothing.lucky}</td>
                <td>{clothing.evade}</td>
                <td>{clothing.counter}</td>
                <td>{clothing.death}</td>
              </tr>)}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
