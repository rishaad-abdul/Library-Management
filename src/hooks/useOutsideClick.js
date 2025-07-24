import { useEffect } from 'react';

/**
 * Hook that triggers a callback when a click occurs outside the given ref
 * @param {Object} ref - React ref to a DOM element
 * @param {Function} callback - Function to run on outside click
 */
export function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}
