import time

from requests import Response
from requests_html import HTMLSession, HTML

from model import DomObject
from model.RHDomObject import RHDomObject
from service.ScrapingService import ScrapingService


class RHScrapingService(ScrapingService):
    """スクレイピング用のラッパークラス"""

    def __init__(self):
        self.session = HTMLSession()

    def get_page(self, url: str, encoding='') -> DomObject:
        temp: Response = self.session.get(url)
        if encoding != '':
            temp.encoding = encoding
        temp2: HTML = temp.html
        time.sleep(1)
        return RHDomObject(temp2)
