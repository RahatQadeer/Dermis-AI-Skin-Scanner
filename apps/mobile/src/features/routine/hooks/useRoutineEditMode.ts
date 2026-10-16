import { useCallback, useEffect, useRef, useState } from 'react';

export function useRoutineEditMode() {
  const [editing, setEditing] = useState(false);
  const [editDoneSparkle, setEditDoneSparkle] = useState(false);
  const [editBurstKey, setEditBurstKey] = useState(0);
  const editDoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (editDoneTimer.current) {
        clearTimeout(editDoneTimer.current);
      }
    },
    [],
  );

  const onEditPress = useCallback(() => {
    if (!editing) {
      setEditing(true);
      return;
    }
    if (editDoneSparkle) {
      return;
    }
    setEditBurstKey((n) => n + 1);
    setEditDoneSparkle(true);
    if (editDoneTimer.current) {
      clearTimeout(editDoneTimer.current);
    }
    editDoneTimer.current = setTimeout(() => {
      setEditDoneSparkle(false);
      setEditing(false);
      editDoneTimer.current = null;
    }, 2000);
  }, [editDoneSparkle, editing]);

  return { editing, editDoneSparkle, editBurstKey, onEditPress };
}
