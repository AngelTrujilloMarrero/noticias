import { useCallback, useMemo } from 'react';
import { usePersistentState } from './usePersistentState.js';

const READ_KEY = 'noticias:leidas';
const STARRED_KEY = 'noticias:destacadas';

function usePersistentIdSet(key) {
  const [items, setItems] = usePersistentState(key, []);
  const ids = useMemo(() => new Set(Array.isArray(items) ? items : []), [items]);

  const add = useCallback(
    (id) => {
      if (!id) return;
      setItems((previous) => (previous.includes(id) ? previous : [...previous, id]));
    },
    [setItems],
  );

  const remove = useCallback(
    (id) => {
      setItems((previous) => previous.filter((item) => item !== id));
    },
    [setItems],
  );

  const toggle = useCallback(
    (id) => {
      setItems((previous) =>
        previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
      );
    },
    [setItems],
  );

  const addMany = useCallback(
    (newIds) => {
      setItems((previous) => [...new Set([...previous, ...newIds.filter(Boolean)])]);
    },
    [setItems],
  );

  return { ids, add, remove, toggle, addMany };
}

export function useArticleState() {
  const read = usePersistentIdSet(READ_KEY);
  const starred = usePersistentIdSet(STARRED_KEY);

  return {
    readIds: read.ids,
    starredIds: starred.ids,
    markRead: read.add,
    unmarkRead: read.remove,
    toggleRead: read.toggle,
    toggleStar: starred.toggle,
    markManyRead: read.addMany,
  };
}
