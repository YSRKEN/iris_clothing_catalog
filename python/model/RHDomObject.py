from typing import Optional, List, MutableMapping

from requests_html import BaseParser, Element

from model.DomObject import DomObject


class RHDomObject(DomObject):
    """DOMオブジェクト"""

    def __init__(self, base_parser: BaseParser):
        self.base_parser = base_parser

    def find(self, query: str) -> Optional['DomObject']:
        temp = self.base_parser.find(query, first=True)
        if temp is None:
            return None
        return RHDomObject(temp)

    def find_all(self, query: str) -> List['DomObject']:
        return [RHDomObject(x) for x in self.base_parser.find(query)]

    @property
    def text(self) -> str:
        return self.base_parser.text

    @property
    def full_text(self) -> str:
        return self.base_parser.full_text

    @property
    def attrs(self) -> MutableMapping:
        # noinspection PyTypeChecker
        temp: Element = self.base_parser
        return temp.attrs
