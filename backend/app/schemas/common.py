from typing import Generic, TypeVar

from bson import ObjectId
from pydantic import BaseModel


class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.with_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, value, _info=None):
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, str):
            if not ObjectId.is_valid(value):
                raise ValueError("Invalid ObjectId string")
            return value
        raise TypeError("ObjectId or valid hex string required")


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    message: str
    success: bool = True
