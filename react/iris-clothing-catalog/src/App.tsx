import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';

const APPLICATION_TITLE = 'めーおーの聖装カタログ';

type SortKey = '' | 'index' | 'reality' | 'iris_name' | 'type' | 'hp' | 'attack' | 'defence' | 'magic' | 'speed' | 'lucky' | 'evade' | 'counter' | 'death';

type SortOrder = 'ascending' | 'descending';

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

const loadClothingData = async (): Promise<IrisClothing[]> => {
  const res = await fetch('./list.json');
  if (!res.ok) {
    return [];
  }
  const res2 = await res.json();
  return res2.map((d: IrisClothing, i: number) => {
    return { ...d, index: i + 1 };
  });
};

const compareClothing = (a: IrisClothing, b: IrisClothing, sortKey: SortKey, sortOrder: SortOrder) => {
  const aVal = (a as { [key: string]: any })[sortKey as string];
  const bVal = (b as { [key: string]: any })[sortKey as string];
  if (aVal < bVal) {
    return sortOrder === 'ascending' ? -1 : 1;
  } else if (aVal > bVal) {
    return sortOrder === 'ascending' ? 1 : -1;
  } else {
    return 0;
  }
};


const Title: React.FC = () => (<>
  <h1 className="d-none d-sm-inline">{APPLICATION_TITLE}</h1>
  <h3 className="d-inline d-sm-none">{APPLICATION_TITLE}</h3>
</>);

const ClothingRecord: React.FC<{ clothing: IrisClothing }> = ({ clothing }) => (
  <tr>
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
  </tr>
);

const App: React.FC = () => {
  const [clothingList, setClothingList] = useState<IrisClothing[]>([]);
  const [clothingList2, setClothingList2] = useState<IrisClothing[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ascending');

  useEffect(() => {
    loadClothingData().then(data => setClothingList(data));
  }, []);

  useEffect(() => {
    if (sortKey === '') {
      setClothingList2(clothingList);
    } else {
      setClothingList2(Array.from(clothingList).sort((a, b) => compareClothing(a, b, sortKey, sortOrder)));
    }
  }, [clothingList, sortKey, sortOrder]);

  const changeSortKey = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder('ascending');
      return;
    }
    if (sortOrder === 'ascending') {
      setSortOrder('descending');
    } else {
      setSortKey('');
    }
  };

  return (
    <Container>
      <Row className="my-3">
        <Col className="text-center">
          <Title />
        </Col>
      </Row>
      <Row className="my-3">
        <Col>
          <h2>検索条件</h2>
          <Form className="mt-3">
            <Form.Group>
              <Button>＋</Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row className="my-3">
        <Col>
          <h2>検索結果</h2>
          <Table className="text-center" size="sm" striped>
            <thead>
              <tr>
                <th onClick={() => changeSortKey('index')}>#{sortKey === 'index' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('reality')}>レアリティ{sortKey === 'reality' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th>二つ名</th>
                <th onClick={() => changeSortKey('iris_name')}>名前{sortKey === 'iris_name' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('type')}>属性{sortKey === 'type' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('hp')}>HP{sortKey === 'hp' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('attack')}>攻撃{sortKey === 'attack' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('defence')}>防御{sortKey === 'defence' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('magic')}>魔力{sortKey === 'magic' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('speed')}>敏捷{sortKey === 'speed' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('lucky')}>幸運{sortKey === 'lucky' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('evade')}>回避率{sortKey === 'evade' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('counter')}>反撃率{sortKey === 'counter' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
                <th onClick={() => changeSortKey('death')}>即死率{sortKey === 'death' ? sortOrder === 'ascending' ? ' ↑' : ' ↓' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {clothingList2.map(clothing => <ClothingRecord key={clothing.index} clothing={clothing} />)}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
