from service.LxmlScrapingService import LxmlScrapingService

if __name__ == '__main__':
    scraping = LxmlScrapingService()
    dom = scraping.get_page('https://xn--l8je7d7jnef7m6d8j6d.xn--wiki-4i9hs14f.com/index.php?%E6%80%A7%E8%83%BD%E4%B8'
                            '%80%E8%A6%A7', 'utf-8')
    for table_tag in dom.find_all('table'):
        thead_tag = table_tag.find('thead')
        if thead_tag is None:
            continue
        thead_text = thead_tag.full_text
        if 'HP' not in thead_text:
            continue
        print(thead_text)
