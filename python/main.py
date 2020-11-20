from typing import List, Dict

from model.IrisClothing import IrisClothing, Skill
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
            # 基礎データを取得
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
            temp = cloth_name.split('】')
            nickname = temp[0].replace('【', '')
            iris_name = temp[1]
            print(f'{reality} 【{nickname}】{iris_name}')

            # 萌技・スキル・アビリティを取得
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

    # 保存
    with open('list.json', 'w', encoding='UTF-8') as f:
        f.write(IrisClothing.schema().dumps(data_list, many=True, ensure_ascii=False, indent=2))
