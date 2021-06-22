import React, { createContext, useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';

const APPLICATION_TITLE = 'めーおーの聖装カタログ';

type SortKey = '' | 'index' | 'reality' | 'iris_name' | 'type' | 'hp' | 'attack' | 'defence' | 'magic' | 'speed' | 'lucky' | 'evade' | 'counter' | 'death';

type SortOrder = 'ascending' | 'descending';

type ActionType = 'changeSortKey' | 'changeFilterStatus' | 'setSelectedClothNickname' | 'setShowDetailModalFlg' | 'setSelectedSkillWord' | 'changeHavingClothFlg';

interface Skill {
  type: '萌技' | 'スキル' | 'アビリティ';
  name: string;
  message: string;
};

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
  link: string;
  skill_list: Skill[];
};

interface Action {
  type: ActionType;
  message?: string;
}

interface Store {
  clothingList: IrisClothing[];
  filteredClothingList: IrisClothing[];
  sortKey: SortKey;
  sortOrder: SortOrder;
  selectedRealityList: string[];
  selectedTypeList: string[];
  selectedNameList: string[];
  selectedClothNickname: string;
  showDetailModalFlg: boolean;
  selectedSkillWord: string;
  selectedSkillList: string[];
  havingClothList: string[];
  dispatch: (action: Action) => void;
};

const REALITY_LIST = ['SSR', 'SR', 'R', 'N'];

const TYPE_LIST = ['力', '芸', '知', '理', '心'];

const NAME_LIST = ["アシュリー",
  "クリス",
  "ソフィ",
  "ラディス",
  "ベアトリーチェ",
  "コト",
  "クレア",
  "パトリシア",
  "フランチェスカ",
  "ポリン",
  "エルミナ",
  "セシル",
  "ティセ",
  "イリーナ",
  "ファム",
  "ラウラ",
  "クルチャ",
  "ヴァレリア",
  "シャロン",
  "ウィル",
  "ルージェニア",
  "プリシラ",
  "リディア",
  "ギゼリック",
  "ナジャ",
  "アナスチガル",
  "フリッカ",
  "その他"
];

const GUEST_LIST = ["フィーナ", "朝霧麻衣", "白崎つぐみ", "鈴木佳奈"];

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

const loadData = () => {
  const temp = window.localStorage.getItem('havingClothList');
  if (temp === null) {
    return [];
  } else {
    return JSON.parse(temp) as string[];
  }
};

const useStore = (): Store => {
  const [clothingList, setClothingList] = useState<IrisClothing[]>([]);
  const [filteredClothingList, setFilteredClothingList] = useState<IrisClothing[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ascending');
  const [selectedRealityList, setSelectedRealityList] = useState<string[]>([]);
  const [selectedTypeList, setSelectedTypeList] = useState<string[]>([]);
  const [selectedNameList, setSelectedNameList] = useState<string[]>([]);
  const [selectedClothNickname, setSelectedClothNickname] = useState('');
  const [showDetailModalFlg, setShowDetailModalFlg] = useState(false);
  const [selectedSkillWord, setSelectedSkillWord] = useState('');
  const [selectedSkillList, setSelectedSkillList] = useState<string[]>([]);
  const [havingClothList, setHavingClothList] = useState<string[]>(loadData());

  useEffect(() => {
    loadClothingData().then(data => setClothingList(data));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('havingClothList', JSON.stringify(havingClothList));
  }, [havingClothList]);

  useEffect(() => {
    const skillList: string[] = [];
    for (let word of selectedSkillWord.replace('　', ' ').split(' ')) {
      if (word === '') {
        continue;
      }
      skillList.push(word);
    }
    setSelectedSkillList(skillList);
  }, [selectedSkillWord]);

  useEffect(() => {
    let newClothingList = [...clothingList];
    if (sortKey !== '') {
      newClothingList = Array.from(clothingList).sort((a, b) => compareClothing(a, b, sortKey, sortOrder));
    }
    if (selectedRealityList.length > 0) {
      newClothingList = newClothingList.filter(c => selectedRealityList.includes(c.reality));
    }
    if (selectedTypeList.length > 0) {
      newClothingList = newClothingList.filter(c => selectedTypeList.includes(c.type));
    }
    if (selectedNameList.length > 0) {
      newClothingList = newClothingList.filter(c => {
        if (selectedNameList.includes(c.iris_name)) {
          return true;
        }
        if (selectedNameList.includes('その他') && GUEST_LIST.includes(c.iris_name)) {
          return true;
        }
        return false;
      });
    }
    if (selectedSkillList.length >= 1) {
      newClothingList = newClothingList.filter(c => {
        if (c.skill_list.length === 0) {
          return false;
        }
        for (let keyword of selectedSkillList) {
          let flg = false;
          for (let skill of c.skill_list) {
            const skillMessage = skill.message;
            if (skillMessage.includes(keyword)) {
              flg = true;
            }
          }
          if (!flg) {
            return false;
          }
        }
        return true;
      });
    }
    setFilteredClothingList(newClothingList);
  }, [clothingList, sortKey, sortOrder, selectedRealityList, selectedTypeList, selectedNameList, selectedSkillList]);

  const dispatch = (action: Action) => {
    switch (action.type) {
      case 'changeSortKey': {
        const key = action.message as SortKey;
        if (sortKey !== key) {
          setSortKey(key);
          setSortOrder('ascending');
          break;
        }
        if (sortOrder === 'ascending') {
          setSortOrder('descending');
        } else {
          setSortKey('');
        }
        break;
      };
      case 'changeFilterStatus': {
        const temp = (action.message as string).split(',');
        const filterType = temp[0];
        const name = temp[1];
        switch (filterType) {
          case 'レアリティ':
            if (selectedRealityList.includes(name)) {
              setSelectedRealityList([...selectedRealityList].filter(n => n !== name));
            } else {
              setSelectedRealityList([...selectedRealityList, name]);
            };
            break;
          case '属性':
            if (selectedTypeList.includes(name)) {
              setSelectedTypeList([...selectedTypeList].filter(n => n !== name));
            } else {
              setSelectedTypeList([...selectedTypeList, name]);
            };
            break;
          case '名前':
            if (selectedNameList.includes(name)) {
              setSelectedNameList([...selectedNameList].filter(n => n !== name));
            } else {
              setSelectedNameList([...selectedNameList, name]);
            };
            break;
        };
        break;
      };
      case 'setSelectedClothNickname':
        setSelectedClothNickname(action.message as string);
        setShowDetailModalFlg(true);
        break;
      case 'setShowDetailModalFlg':
        setShowDetailModalFlg((action.message as string) === 'true');
        break;
      case 'setSelectedSkillWord':
        setSelectedSkillWord(action.message as string);
        break;
      case 'changeHavingClothFlg': {
        const clothNickName = action.message as string;
        if (havingClothList.includes(clothNickName)) {
          setHavingClothList(havingClothList.filter(s => s !== clothNickName));
        } else {
          setHavingClothList([...havingClothList, clothNickName]);
        }
        break;
      }
    }
  };

  return {
    clothingList,
    filteredClothingList,
    sortKey,
    sortOrder,
    selectedRealityList,
    selectedTypeList,
    selectedNameList,
    selectedClothNickname,
    showDetailModalFlg,
    selectedSkillWord,
    selectedSkillList,
    havingClothList,
    dispatch,
  };
};

const Context = createContext<Store>({} as Store);

const Title: React.FC = () => (<>
  <h1 className="d-none d-sm-inline">{APPLICATION_TITLE}</h1>
  <h3 className="d-inline d-sm-none">{APPLICATION_TITLE}</h3>
</>);

const TableHeader: React.FC = () => {
  const {
    sortKey,
    sortOrder,
    dispatch
  } = useContext(Context);

  const changeSortKey = (key: SortKey) => dispatch({ type: 'changeSortKey', message: key as string });

  return <tr>
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
    <th>操作</th>
  </tr>;
};

const ClothingRecord: React.FC<{ clothing: IrisClothing }> = ({ clothing }) => {
  const { havingClothList, dispatch } = useContext(Context);

  const onClickDetail = () => dispatch({ type: 'setSelectedClothNickname', message: clothing.nickname });
  const onClickHaving = () => dispatch({ type: 'changeHavingClothFlg', message: clothing.nickname });

  return (
    <tr>
      <td>{clothing.index}</td>
      <td>{clothing.reality}</td>
      {clothing.link !== '#'
        ? <td><a href={clothing.link} target="_blank" rel="noreferrer">{clothing.nickname}</a></td>
        : <td>{clothing.nickname}</td>}
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
      <td>
        {havingClothList.includes(clothing.nickname)
          ? <Button size="sm" variant="danger" onClick={onClickHaving}>所持</Button>
          : <Button size="sm" variant="primary" onClick={onClickHaving}>未所持</Button>
        }
        <Button size="sm" className="ml-1" variant="info" onClick={onClickDetail}>詳細...</Button>
      </td>
    </tr>
  );
};

const FilterButtonList: React.FC<{
  title: string,
  nameList: string[],
  selectedNameList: string[]
}> = ({ title, nameList, selectedNameList }) => {
  const { dispatch } = useContext(Context);

  const onClickButton = (name: string) => {
    dispatch({ type: 'changeFilterStatus', message: `${title},${name}` });
  };

  return (
    <Form.Group>
      <Form.Label><strong>{title}</strong> ({selectedNameList.length}件選択)</Form.Label><br />
      {nameList.map((buttonName) => <Button key={buttonName} className="mr-3 mb-3"
        variant={selectedNameList.includes(buttonName) ? "secondary" : "outline-secondary"}
        onClick={() => onClickButton(buttonName)}>{buttonName}</Button>)}
    </Form.Group>
  );
};

const ClothDetailModal: React.FC = () => {
  const {
    showDetailModalFlg,
    selectedClothNickname,
    clothingList,
    dispatch,
  } = useContext(Context);

  const onCloseDetailModal = () => dispatch({ type: 'setShowDetailModalFlg', message: 'false' });

  if (selectedClothNickname === '') {
    return <></>;
  }

  const clothData = clothingList.filter(c => c.nickname === selectedClothNickname)[0];
  const specialList = clothData.skill_list.filter(s => s.type === '萌技');
  const skillList = clothData.skill_list.filter(s => s.type === 'スキル');
  const abilityList = clothData.skill_list.filter(s => s.type === 'アビリティ');

  return <Modal show={showDetailModalFlg} onHide={onCloseDetailModal}>
    <Modal.Header closeButton>
      <Modal.Title>聖装の詳細</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ul>
        <li>聖装名：<strong>【{clothData.nickname}】{clothData.iris_name}</strong></li>
        <li>レアリティ：<strong>{clothData.reality}</strong></li>
        <li>属性：<strong>{clothData.type}</strong></li>
        <li>萌技：
          {specialList.length === 0 ? <strong>なし</strong>
            : <span><strong>{specialList[0].name}</strong><br />({specialList[0].message})</span>}
        </li>
        <li>スキル：
          <ul>
            {skillList.map(s => <li><strong>{s.name}</strong><br />({s.message})</li>)}
          </ul>
        </li>
        <li>アビリティ：
          <ul>
            {abilityList.map(a => <li><strong>{a.name}</strong><br />({a.message})</li>)}
          </ul>
        </li>
      </ul>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={onCloseDetailModal}>
        OK
    </Button>
    </Modal.Footer>
  </Modal>;
};

const MainForm: React.FC = () => {
  const {
    filteredClothingList,
    selectedRealityList,
    selectedTypeList,
    selectedNameList,
    selectedSkillWord,
    selectedSkillList,
    dispatch,
  } = useContext(Context);

  const [showModalFlg, setShowModalFlg] = useState(false);

  const onShowModal = () => {
    setShowModalFlg(true);
  };

  const onCloseModal = () => {
    setShowModalFlg(false);
  };

  const onCancelModal = () => {
    setShowModalFlg(false);
  };

  return (
    <>
      <Container>
        <Row className="my-3">
          <Col className="text-center">
            <Title />
          </Col>
        </Row>
        <Row>
          <Col className="text-center">
            <span className="d-inline-block mr-3">最終更新：2021/06/22</span>
            <span className="d-inline-block mr-3"><a href="https://twitter.com/YSRKEN/status/1340182344439717891" rel="noreferrer" target="_blank">使い方</a></span>
            <span className="d-inline-block mr-3"><a href="https://github.com/YSRKEN/iris_clothing_catalog" rel="noreferrer" target="_blank">GitHub</a> </span>
            <span><a href="https://twitter.com/YSRKEN" rel="noreferrer" target="_blank">作者のTwitter</a></span>
          </Col>
        </Row>
        <Row className="my-3">
          <Col>
            <h2>検索条件</h2>
            <Form className="mt-3">
              <Form.Group>
                <Button onClick={onShowModal}>変更...</Button>
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <Row className="my-3">
          <Col>
            <h2>検索結果</h2>
            <Table className="text-center" size="sm" striped>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {filteredClothingList.map(clothing => <ClothingRecord key={clothing.index} clothing={clothing} />)}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <Modal show={showModalFlg} onHide={onCancelModal}>
        <Modal.Header closeButton>
          <Modal.Title>検索条件を追加</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FilterButtonList title="レアリティ" nameList={REALITY_LIST} selectedNameList={selectedRealityList} />
            <FilterButtonList title="属性" nameList={TYPE_LIST} selectedNameList={selectedTypeList} />
            <FilterButtonList title="名前" nameList={NAME_LIST} selectedNameList={selectedNameList} />
            <Form.Group>
              <Form.Label><strong>萌技・スキル・アビリティ</strong> (検索ワード{selectedSkillList.length}個)</Form.Label><br />
              <Form.Control value={selectedSkillWord}
                placeholder="入力した文字が含まれるもののみ表示 (複数指定可能)"
                onChange={(e) => dispatch({ type: 'setSelectedSkillWord', message: e.currentTarget.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancelModal}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={onCloseModal}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <ClothDetailModal />
    </>
  );
};

const App: React.FC = () => {
  return <Context.Provider value={useStore()}>
    <MainForm />
  </Context.Provider>;
}

export default App;
