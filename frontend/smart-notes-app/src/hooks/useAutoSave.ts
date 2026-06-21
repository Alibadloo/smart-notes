import { useEffect, useRef } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { updateNote } from '../store/noteSlice';

export function useAutoSave(noteId: number | undefined, title: string, content: string, delay = 1500) {
  const dispatch = useAppDispatch();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = useRef({ title, content });

  useEffect(() => {
    if (!noteId) return;
    if (prevRef.current.title === title && prevRef.current.content === content) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      dispatch(updateNote({ id: noteId, data: { title, content } }));
      prevRef.current = { title, content };
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [noteId, title, content, delay, dispatch]);
}
