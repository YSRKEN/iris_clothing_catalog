from typing import List

from service.LxmlScrapingService import LxmlScrapingService

if __name__ == '__main__':
    scraping = LxmlScrapingService()
    dom = scraping.get_page('https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E6%80%A7%E8%83%BD%E4%B8'
                            '%80%E8%A6%A7', 'utf-8')
    data_list: List[str] = []
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
            cloth_text = f'{cloth_name} {cloth_type}属性 HP{cloth_hp} 攻{cloth_attack} 防{cloth_defence}' \
                         f' 魔{cloth_magic} 敏{cloth_speed} 運{cloth_lucky} 避{cloth_evade} 反{cloth_counter}' \
                         f' 死{cloth_death}'
            if cloth_text not in data_list:
                data_list.append(cloth_text)
    for cloth_text in data_list:
        print(cloth_text)
