from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.subject import SubjectRead, SubjectWithConcepts
from app.schemas.concept import ConceptRead
from app.repositories.subject_repo import SubjectRepository
from app.repositories.concept_repo import ConceptRepository

router = APIRouter(prefix="/subjects", tags=["Subjects & Concepts"])


@router.get("", response_model=List[SubjectWithConcepts])
def get_subjects(db: Session = Depends(get_db)):
    """Retrieve all available programming subjects along with technical concepts."""
    subject_repo = SubjectRepository(db)
    subjects = subject_repo.get_all_with_concepts()
    return subjects


@router.get("/{subject_id}/concepts", response_model=List[ConceptRead])
def get_concepts_for_subject(subject_id: int, db: Session = Depends(get_db)):
    """Retrieve technical concepts for a given subject."""
    subject_repo = SubjectRepository(db)
    subject = subject_repo.get_by_id(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with id '{subject_id}' not found.",
        )
    concept_repo = ConceptRepository(db)
    return concept_repo.get_by_subject_id(subject_id)
