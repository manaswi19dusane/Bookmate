from datetime import datetime, timedelta
from typing import Dict

from jose import jwt
from passlib.context import CryptContext

from app.config import settings
from app.interfaces.schemas import LoginRequest, RegisterRequest
from app.domain.models_user import User, UserId
from app.infrastructure.repositories.user_repo import UserRepository
from app.domain.exceptions import UserAlreadyExists, UserNotFound


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, data: Dict[str, str], expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

    async def register_user(self, payload: RegisterRequest) -> Dict[str, str]:
        existing_user = await self.user_repo.get_by_email(payload.email)
        if existing_user is not None:
            raise UserAlreadyExists(payload.email)

        hashed_password = self.get_password_hash(payload.password)
        user = User(
            id=UserId.new(),
            email=payload.email,
            password=hashed_password,
            created_at=datetime.utcnow(),
        )
        await self.user_repo.add(user)

        access_token = self.create_access_token({"sub": user.id.value})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id.value,
                "email": user.email,
                "created_at": user.created_at,
            },
        }

    async def authenticate_user(self, payload: LoginRequest) -> Dict[str, str]:
        user = await self.user_repo.get_by_email(payload.email)
        if user is None:
            raise UserNotFound(payload.email)
        if not self.verify_password(payload.password, user.password):
            raise UserNotFound(payload.email)

        access_token = self.create_access_token({"sub": user.id.value})

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id.value,
                "email": user.email,
                "created_at": user.created_at,
            },
        }