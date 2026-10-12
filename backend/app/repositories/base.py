from typing import Any

from bson import ObjectId


def document_to_dict(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    if doc is None:
        return None
    res = dict(doc)
    if "_id" in res:
        res["id"] = str(res.pop("_id"))
    return res


def documents_to_list(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [document_to_dict(doc) for doc in docs if doc is not None]


def to_object_id(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise ValueError(f"Invalid ObjectId format: {id_str}")
