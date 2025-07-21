from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas

def get_todos(db: Session, skip: int = 0, limit: int = 100) -> List[models.Todo]:
    """Get all todos with pagination"""
    return db.query(models.Todo).offset(skip).limit(limit).all()

def get_todo(db: Session, todo_id: int) -> Optional[models.Todo]:
    """Get a single todo by ID"""
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

def create_todo(db: Session, todo: schemas.TodoCreate) -> models.Todo:
    """Create a new todo"""
    db_todo = models.Todo(title=todo.title, content=todo.content)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, todo_id: int, todo_update: schemas.TodoUpdate) -> Optional[models.Todo]:
    """Update an existing todo"""
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        if todo_update.title is not None:
            db_todo.title = todo_update.title
        if todo_update.content is not None:
            db_todo.content = todo_update.content
        if todo_update.completed is not None:
            db_todo.completed = todo_update.completed
        db.commit()
        db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, todo_id: int) -> bool:
    """Delete a todo"""
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo:
        db.delete(db_todo)
        db.commit()
        return True
    return False 