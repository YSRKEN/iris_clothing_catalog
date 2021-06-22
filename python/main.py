from pprint import pprint
from typing import List, Dict

from model.DomObject import DomObject
from model.IrisClothing import IrisClothing, Skill
from service.LxmlScrapingService import LxmlScrapingService
from service.ScrapingService import ScrapingService
from service.i_database_service import IDataBaseService
from service.sqlite_database_service import SqliteDataBaseService

DRESS_LIST_URL = 'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E6%80%A7%E8%83%BD%E4%B8%80%E8%A6%A7'
GUEST_DICT: Dict[str, str] = {
    'フィーナ':
        'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E3%83%95%E3%82%A3%E3%83%BC%E3%83%8A',
    '朝霧麻衣':
        'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E9%BA%BB%E8%A1%A3',
    '白崎つぐみ':
        'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E7%99%BD%E5%B4%8E%E3%81%A4%E3%81%90%E3%81%BF',
    '鈴木佳奈':
        'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E9%88%B4%E6%9C%A8%E4%BD%B3%E5%A5%88',
    '千堂瑛里華':
        'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E5%8D%83%E5%A0%82%E7%91%9B%E9%87%8C%E8%8F%AF',
    '悠木陽菜':
        'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E6%82%A0%E6%9C%A8%E9%99%BD%E8%8F%9C',
}


def is_dress_list_table_tag(table_tag: DomObject) -> bool:
    thead_tag = table_tag.find('thead')
    if thead_tag is None:
        return False
    thead_text = thead_tag.full_text
    if 'HP' not in thead_text:
        return False

    return True


def get_raw_dress_list(table_tag: DomObject) -> List[Dict[str, str]]:
    th_text_list = [x.text for x in table_tag.find('thead').find_all('th')]
    dress_name_index = th_text_list.index('名前')
    dress_type_index = th_text_list.index('属性')
    dress_hp_index = th_text_list.index('HP')
    dress_attack_index = th_text_list.index('攻撃')
    dress_defence_index = th_text_list.index('防御')
    dress_magic_index = th_text_list.index('魔力')
    dress_speed_index = th_text_list.index('敏捷')
    dress_lucky_index = th_text_list.index('幸運')
    dress_evade_index = th_text_list.index('回避率')
    dress_counter_index = th_text_list.index('反撃率')
    dress_death_index = th_text_list.index('即死率')

    table_text = table_tag.full_text
    if '高潔なる煌めきの銀閃' in table_text:
        dress_reality = 'SSR'
    elif '白銀の疾風' in table_text:
        dress_reality = 'SR'
    elif '忠信の私服' in table_text:
        dress_reality = 'R'
    elif '騎士の私服' in table_text:
        dress_reality = 'N'
    else:
        dress_reality = ''

    raw_dress_list: List[Dict[str, str]] = []
    for tr_tag in table_tag.find_all('tbody > tr'):
        # 基礎データを取得
        td_text_list = [x.full_text for x in tr_tag.find_all('td')]
        dress_name = td_text_list[dress_name_index]
        dress_type = td_text_list[dress_type_index]
        dress_hp = td_text_list[dress_hp_index]
        dress_attack = td_text_list[dress_attack_index]
        dress_defence = td_text_list[dress_defence_index]
        dress_magic = td_text_list[dress_magic_index]
        dress_speed = td_text_list[dress_speed_index]
        dress_lucky = td_text_list[dress_lucky_index]
        dress_evade = td_text_list[dress_evade_index]
        dress_counter = td_text_list[dress_counter_index]
        dress_death = td_text_list[dress_death_index]
        dress_link = tr_tag.find_all('td')[dress_name_index].find('a').attrs['href']
        temp = dress_name.split('】')
        dress_nickname = temp[0].replace('【', '')
        dress_iris_name = temp[1]
        raw_dress_list.append({
            'reality': dress_reality,
            'nickname': dress_nickname,
            'iris_name': dress_iris_name,
            'type': dress_type,
            'hp': dress_hp,
            'attack': dress_attack,
            'defence': dress_defence,
            'magic': dress_magic,
            'speed': dress_speed,
            'lucky': dress_lucky,
            'evade': dress_evade,
            'counter': dress_counter,
            'death': dress_death,
            'link': dress_link,
        })
    return raw_dress_list


def get_skill_list_by_guest_name(scraping: ScrapingService, guest_name: str) -> List[Skill]:
    dom = scraping.get_page(GUEST_DICT[guest_name], 'utf-8')

    # trとtdの状況をザックリ読み取る
    table_data: List[List[str]] = []
    for table_tag in dom.find_all('table'):
        # スキル・アビリティ以外のテーブルを読まないように、ヘッダーで判別する
        temp = table_tag.find('tr')
        if temp is None:
            continue
        temp2 = temp.find('th')
        if temp2 is None:
            continue
        if temp2.text != '所持':
            continue

        # 読み取る
        for tr_tag in table_tag.find_all('tbody > tr'):
            temp: List[str] = []
            for td_tag in tr_tag.find_all('td'):
                temp.append(td_tag.full_text)
            table_data.append(temp)

    # そこから萌技・スキル・アビリティの情報を取り出す
    skill_list: List[Skill] = []
    skill_data_header_index = -1
    ability_data_header_index = -1
    for i in range(0, len(table_data)):
        if '萌技' in table_data[i] and len(table_data[i]) == 2:
            # 萌技の記録位置を割り出したので、追記
            # 配列のインデックスは、位置を割り出す手間から
            # ハードコーディングしている
            skill_list.append(Skill(type='萌技', name=table_data[i + 1][2],
                                    message=table_data[i + 1][3]))
        if 'スキル' in table_data[i] and len(table_data[i]) == 2:
            skill_data_header_index = i
        if 'アビリティ' in table_data[i] and len(table_data[i]) == 2:
            ability_data_header_index = i

    # スキルを読み取り
    for i in range(skill_data_header_index + 1, ability_data_header_index):
        if len(table_data[i]) >= 4 and table_data[i][0] in ['N', 'R', 'SR', 'SSR', '潜在SSR']:
            skill = Skill(type='スキル', name='[' + table_data[i][0] + '] ' + table_data[i][2],
                          message=table_data[i][3])
            print(skill)
            skill_list.append(skill)

    # アビリティを読み取り
    for i in range(ability_data_header_index + 1, len(table_data)):
        if len(table_data[i]) >= 4 and table_data[i][0] in ['N', 'R', 'SR', 'SSR', '潜在SSR']:
            skill = Skill(type='アビリティ', name='[' + table_data[i][0] + '] ' + table_data[i][2],
                          message=table_data[i][3])
            print(skill)
            skill_list.append(skill)
    return skill_list


def get_skill_list_by_link(scraping: ScrapingService, link_url: str) -> List[Skill]:
    dom = scraping.get_page(link_url, 'utf-8')
    skill_list: List[Skill] = []
    for table_tag in dom.find_all('td table'):
        # ヘッダーから、スキルアビリティかどうかの見当をつける
        thead_tag = table_tag.find('thead')
        tbody_tag = table_tag.find('tbody')
        if tbody_tag is None:
            continue
        tbody_text = tbody_tag.full_text
        if '分類' not in tbody_text:
            if thead_tag is None:
                continue
            thead_text = thead_tag.full_text
            if '分類' not in thead_text:
                continue

        # 読み取り
        record_type = ''
        for tr_tag2 in table_tag.find_all('tbody > tr'):
            # 読み取り処理
            th_tag = tr_tag2.find('th')
            td_tags = tr_tag2.find_all('td')
            if len(td_tags) < 3:
                continue
            if th_tag is not None:
                record_type = th_tag.text
            if record_type == '':
                print('エラー：萌技/スキル/アビリティのタイプが読み取れません')
                print('  ' + link_url)
                exit()

            # テキスト修正対策
            message_text = td_tags[2].full_text
            temp2 = td_tags[2].find_all('del')
            if len(temp2) > 0:
                for del_tag in temp2:
                    message_text = message_text.replace(del_tag.full_text, '')

            # 追加
            skill_list.append(Skill(type=record_type, name=td_tags[1].text,
                                    message=message_text.replace('ＨＰ', 'HP')))

    if len(skill_list) == 0:
        # Nカードにすらスキルとアビリティはあるので、配列長が0になることは通常ありえない
        print('警告：萌技/スキル/アビリティのタイプが読み取れていません')
        print('  ' + link_url)

    return skill_list


def get_dress_data_by_raw_data(scraping: ScrapingService, raw_data: Dict[str, str]) -> IrisClothing:
    if '?' in raw_data['iris_name']:
        print('　警告：次のアイリスの詳細な情報が取得できませんでした.')
        print(raw_data)
        return IrisClothing(
            reality=raw_data['reality'],
            nickname=raw_data['nickname'],
            iris_name=raw_data['iris_name'].replace('?', ''),
            type=raw_data['type'],
            hp=int(raw_data['hp']),
            attack=int(raw_data['attack']),
            defence=int(raw_data['defence']),
            magic=int(raw_data['magic']),
            speed=int(raw_data['speed']),
            lucky=int(raw_data['lucky']),
            evade=int(raw_data['evade']),
            counter=int(raw_data['counter']),
            death=int(raw_data['death']),
            link='#',
            skill_list=[]
        )

    skill_list: List[Skill] = []
    for guest in GUEST_DICT:
        if raw_data['iris_name'] == guest:
            skill_list = get_skill_list_by_guest_name(scraping, guest)
            break
    if len(skill_list) == 0:
        skill_list = get_skill_list_by_link(scraping, raw_data['link'])

    return IrisClothing(
            reality=raw_data['reality'],
            nickname=raw_data['nickname'],
            iris_name=raw_data['iris_name'],
            type=raw_data['type'],
            hp=int(raw_data['hp']),
            attack=int(raw_data['attack']),
            defence=int(raw_data['defence']),
            magic=int(raw_data['magic']),
            speed=int(raw_data['speed']),
            lucky=int(raw_data['lucky']),
            evade=int(raw_data['evade']),
            counter=int(raw_data['counter']),
            death=int(raw_data['death']),
            link=raw_data['link'],
            skill_list=skill_list,
        )


def get_dress_list(scraping: ScrapingService) -> List[IrisClothing]:
    dress_list: List[IrisClothing] = []

    # 一覧のデータを取得する
    dom = scraping.get_page(DRESS_LIST_URL, 'utf-8', cache=False)
    # 各テーブルを確認し、聖装一覧なら更に読み込みを続ける
    for table_tag in dom.find_all('table'):
        # 聖装一覧かどうかを判定する
        if not is_dress_list_table_tag(table_tag):
            continue

        # 聖装一覧なので、各列の情報をざっくり読み取る
        raw_dress_list = get_raw_dress_list(table_tag)

        # ザックリ読み取った情報に、詳細ページの情報を付与して正データとする
        for raw_dress in raw_dress_list:
            dress = get_dress_data_by_raw_data(scraping, raw_dress)
            print(f'[{dress.reality}]【{dress.nickname}】{dress.iris_name}')
            dress_list.append(dress)
    return dress_list


def main(db_path: str, save_path: str):
    # スクレイピングの準備
    print('初期化中...')
    database: IDataBaseService = SqliteDataBaseService(db_path)
    scraping: ScrapingService = LxmlScrapingService(database)
    print('完了.')

    # スクレイピング処理
    print('処理中...')
    dress_list = get_dress_list(scraping)
    print('完了.')

    # 結果を保存する
    print('保存中...')
    with open(save_path, 'w', encoding='UTF-8') as f:
        f.write(IrisClothing.schema().dumps(dress_list, many=True, ensure_ascii=False, indent=2, sort_keys=True))
    print('完了.')


if __name__ == '__main__':
    main('database.db', 'list.json')
