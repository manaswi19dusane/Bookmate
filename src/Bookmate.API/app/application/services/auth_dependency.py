from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.infrastructure.db import async_session
from app.infrastructure.repositories.user_repo import UserRepository
from app.domain.exceptions import UserNotFound
from app.domain.models_user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")


async def get_session():
    async with async_session() as session:
        yield session


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    repo = UserRepository(session)
    try:
        return await repo.get_by_id(user_id)
    except UserNotFound:
        raise credentials_exception