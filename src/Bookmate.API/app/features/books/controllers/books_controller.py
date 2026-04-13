from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.features.books.dtos.book_dtos import CreateBookDTO, UpdateBookDTO, BookResponseDTO
from app.features.books.usecases.create_book import CreateBookUseCase
from app.features.books.usecases.list_books import ListBooksUseCase
from app.features.books.usecases.Update_book import UpdateBookUseCase
from app.features.books.usecases.Delete_book import DeleteBookUseCase
from app.infrastructure.repositories.book_repo import BookRepository
from app.infrastructure.db import get_db_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/books", tags=["Books"])

def get_book_repo(db: AsyncSession = Depends(get_db_session)) -> BookRepository:
    return BookRepository(db)

@router.get("/", response_model=List[BookResponseDTO], status_code=status.HTTP_200_OK)
async def get_all_books(
    repo: BookRepository = Depends(get_book_repo)
):
    """Get all books from database"""
    try:
        use_case = ListBooksUseCase(repo)
        return await use_case.execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch books: {str(e)}"
        )

@router.post("/", response_model=BookResponseDTO, status_code=status.HTTP_201_CREATED)
async def create_book(
    book_data: CreateBookDTO,
    repo: BookRepository = Depends(get_book_repo)
):
    """Create a new book"""
    try:
        use_case = CreateBookUseCase(repo)
        return await use_case.execute(book_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create book: {str(e)}"
        )

@router.put("/{book_id}", response_model=BookResponseDTO, status_code=status.HTTP_200_OK)
async def update_book(
    book_id: str,
    book_data: UpdateBookDTO,
    repo: BookRepository = Depends(get_book_repo)
):
    """Update an existing book"""
    try:
        use_case = UpdateBookUseCase(repo)
        return await use_case.execute(book_id, book_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update book: {str(e)}"
        )

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    repo: BookRepository = Depends(get_book_repo)
):
    """Delete a book"""
    try:
        use_case = DeleteBookUseCase(repo)
        await use_case.execute(book_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete book: {str(e)}"
        )