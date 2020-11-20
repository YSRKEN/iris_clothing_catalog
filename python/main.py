from typing import List

from model.IrisClothing import IrisClothing
from service.LxmlScrapingService import LxmlScrapingService

if __name__ == '__main__':
    # スクレイピングの準備
    scraping = LxmlScrapingService()

    # 一覧ページを読み取って、一覧を作成する
    dom = scraping.get_page('https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E6%80%A7%E8%83%BD%E4%B8'
                            '%80%E8%A6%A7', 'utf-8')
    data_list: List[IrisClothing] = []
    for table_tag in dom.find_all('table'):
        # ヘッダーから、聖装一覧かどうかの検討をつける
        thead_tag = table_tag.find('thead')
        if thead_tag is None:
            continue
        thead_text = thead_tag.full_text
        if 'HP' not in thead_text:
            continue
        th_text_list = [x.text for x in thead_tag.find_all('th')]
        name_index = th_text_list.index('名前')
        type_index = th_text_list.index('属性')
        hp_index = th_text_list.index('HP')
        attack_index = th_text_list.index('攻撃')
        defence_index = th_text_list.index('防御')
        magic_index = th_text_list.index('魔力')
        speed_index = th_text_list.index('敏捷')
        lucky_index = th_text_list.index('幸運')
        evade_index = th_text_list.index('回避率')
        counter_index = th_text_list.index('反撃率')
        death_index = th_text_list.index('即死率')

        # 基礎データを取得する
        table_text = table_tag.full_text
        if '高潔なる煌めきの銀閃' in table_text:
            reality = 'SSR'
        elif '白銀の疾風' in table_text:
            reality = 'SR'
        elif '忠信の私服' in table_text:
            reality = 'R'
        elif '騎士の私服' in table_text:
            reality = 'N'
        else:
            reality = ''

        for tr_tag in table_tag.find_all('tbody > tr'):
            td_text_list = [x.full_text for x in tr_tag.find_all('td')]
            cloth_name = td_text_list[name_index]
            cloth_type = td_text_list[type_index]
            cloth_hp = td_text_list[hp_index]
            cloth_attack = td_text_list[attack_index]
            cloth_defence = td_text_list[defence_index]
            cloth_magic = td_text_list[magic_index]
            cloth_speed = td_text_list[speed_index]
            cloth_lucky = td_text_list[lucky_index]
            cloth_evade = td_text_list[evade_index]
            cloth_counter = td_text_list[counter_index]
            cloth_death = td_text_list[death_index]
            cloth_link = tr_tag.find_all('td')[name_index].find('a').attrs['href']
            temp = cloth_name.split('】')
            nickname = temp[0].replace('【', '')
            iris_name = temp[1]
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
            )
            if len([x for x in data_list if x.nickname == cloth_data.nickname]) == 0:
                data_list.append(cloth_data)

    # 保存
    with open('list.json', 'w', encoding='UTF-8') as f:
        f.write(IrisClothing.schema().dumps(data_list, many=True, ensure_ascii=False, indent=2))
