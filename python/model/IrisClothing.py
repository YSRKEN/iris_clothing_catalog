from dataclasses import dataclass
from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class IrisClothing:
    reality: str
    nickname: str
    iris_name: str
    type: str
    hp: int
    attack: int
    defence: int
    magic: int
    speed: int
    lucky: int
    evade: int
    counter: int
    death: int
