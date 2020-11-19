import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';

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


const Title: React.FC = () => (<>
  <h1 className="d-none d-sm-inline">{APPLICATION_TITLE}</h1>
  <h3 className="d-inline d-sm-none">{APPLICATION_TITLE}</h3>
</>);

const App: React.FC = () => {
  const [clothingList, setClothingList] = useState<IrisClothing[]>([]);
  const [clothingList2, setClothingList2] = useState<IrisClothing[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ascending');

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

  useEffect(() => {
    console.log(sortKey);
    console.log(sortOrder);
    if (sortKey === '') {
      setClothingList2(clothingList);
    } else {
      if (sortOrder === 'ascending') {
        setClothingList2(Array.from(clothingList).sort((a: IrisClothing, b: IrisClothing) => {
          const aVal = (a as { [key: string]: any })[sortKey as string];
          const bVal = (b as { [key: string]: any })[sortKey as string];
          if (aVal < bVal) {
            return -1;
          } else if (aVal > bVal) {
            return 1;
          } else {
            return 0;
          }
        }));
      } else {
        setClothingList2(Array.from(clothingList).sort((a: IrisClothing, b: IrisClothing) => {
          const aVal = (a as { [key: string]: any })[sortKey as string];
          const bVal = (b as { [key: string]: any })[sortKey as string];
          if (aVal < bVal) {
            return 1;
          } else if (aVal > bVal) {
            return -1;
          } else {
            return 0;
          }
        }));
      }
    }
  }, [clothingList, sortKey, sortOrder]);

  const changeSortKey = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder('ascending');
    } else {
      if (sortOrder === 'ascending') {
        setSortOrder('descending');
      } else if (sortOrder === 'descending') {
        setSortKey('');
      }
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
        <Col className="text-center">
          <Table size="sm" striped>
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
              {clothingList2.map(clothing => <tr key={clothing.index}>
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
