import time

import lxml
import requests

from model import DomObject
from model.LxmlDomObject import LxmlDomObject
from service.ScrapingService import ScrapingService


class LxmlScrapingService(ScrapingService):
    """スクレイピング用のラッパークラス"""

    def get_page(self, url: str, encoding='') -> DomObject:
        response = requests.get(url)
        if encoding != '':
            response.encoding = encoding
        text = response.text.encode(response.encoding, 'ignore').decode(response.encoding, 'ignore')\
            .encode(response.encoding, 'ignore')
        time.sleep(1)
        return LxmlDomObject(lxml.html.fromstring(text))
