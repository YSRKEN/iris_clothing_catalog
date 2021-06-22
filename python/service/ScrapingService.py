from abc import abstractmethod, ABCMeta

from model import DomObject


class ScrapingService(metaclass=ABCMeta):
    """スクレイピング用のラッパークラス"""

    @abstractmethod
    def get_page(self, url: str, encoding='', cache=False) -> DomObject:
        """WebページのDOMオブジェクトを取得する

        Parameters
        ----------
        url URL
        encoding 文字エンコーディング(空文字列なら自動判定)
        cache キャッシュ機構をONにする場合はTrue

        Returns
        -------
            DOM[オブジェクト
        """
        pass
