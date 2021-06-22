from pprint import pprint
from typing import List, Dict

from model.DomObject import DomObject
from model.IrisClothing import IrisClothing, Skill
from service.LxmlScrapingService import LxmlScrapingService
from service.ScrapingService import ScrapingService
from service.i_database_service import IDataBaseService
from service.sqlite_database_service import SqliteDataBaseService

DRESS_LIST_URL = 'https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E6%80%A7%E8%83%BD%E4%B8%80%E8%A6%A7'


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
        for raw_dress in raw_dress_list:
            print(raw_dress)
    return dress_list


def main(db_path: str, save_path: str):
    # スクレイピングの準備
    database: IDataBaseService = SqliteDataBaseService(db_path)
    scraping: ScrapingService = LxmlScrapingService(database)

    # スクレイピング処理
    dress_list = get_dress_list(scraping)

    # 結果を保存する
    # with open(save_path, 'w', encoding='UTF-8') as f:
    #     f.write(IrisClothing.schema().dumps(dress_list, many=True, ensure_ascii=False, indent=2, sort_keys=True))


if __name__ == '__main__':
    main('database.db', 'list.json')


"""
            # 萌技・スキル・アビリティを取得
            if '?' not in iris_name:
                cloth_link = tr_tag.find_all('td')[name_index].find('a').attrs['href']
                dom2 = scraping.get_page(cloth_link, 'utf-8')
                skill_list: List[Skill] = []
                for table_tag2 in dom2.find_all('td table'):
                    # ヘッダーから、スキルアビリティかどうかの検討をつける
                    thead_tag2 = table_tag2.find('thead')
                    tbody_tag2 = table_tag2.find('tbody')
                    if tbody_tag2 is None:
                        continue
                    tbody2_text = tbody_tag2.full_text
                    if '分類' not in tbody2_text:
                        if thead_tag2 is None:
                            continue
                        thead2_text = thead_tag2.full_text
                        if '分類' not in thead2_text:
                            continue

                    # 読み取り
                    record_type = ''
                    for tr_tag2 in table_tag2.find_all('tbody > tr'):
                        th_tag = tr_tag2.find('th')
                        td_tags = tr_tag2.find_all('td')
                        if len(td_tags) < 3:
                            continue
                        if th_tag is not None:
                            record_type = th_tag.text
                        # テキスト修正対策
                        message_text = td_tags[2].full_text
                        temp2 = td_tags[2].find_all('del')
                        if len(temp2) > 0:
                            for del_tag in temp2:
                                message_text = message_text.replace(del_tag.full_text, '')
                        skill_list.append(Skill(type=record_type, name=td_tags[1].text,
                                                message=message_text.replace('ＨＰ', 'HP')))
            else:
                # まだ詳細ページが作成されていない場合の処理
                cloth_link = '#'
                skill_list = []
                iris_name = iris_name.replace('?', '')

            cloth_data = IrisClothing(
                reality=reality,
                nickname=nickname,
                iris_name=iris_name,
                type=cloth_type,
                hp=cloth_hp,
                attack=cloth_attack,
                defence=cloth_defence,
                magic=cloth_magic,
                speed=cloth_speed,
                lucky=cloth_lucky,
                evade=cloth_evade,
                counter=cloth_counter,
                death=cloth_death,
                link=cloth_link,
                skill_list=skill_list
            )
            if len([x for x in data_list if x.nickname == cloth_data.nickname]) == 0:
                data_list.append(cloth_data)
                print(cloth_data)

"""
