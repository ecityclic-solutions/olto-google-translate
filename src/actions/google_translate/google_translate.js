/**
 * Get google translate text.
 * @module actions/google_translate
 */

import { GET_GOOGLE_TRANSLATE_TEXT } from '../../constants/ActionTypes';

/**
 * Get google translate text.
 * @function GetRegistry
 * @returns {Object} Get translation.
 */
export function getGoogleTranslateText(text) {
  return {
    type: GET_GOOGLE_TRANSLATE_TEXT,
    text: text,
    request: {
      op: 'post',
      path: `/@google_translate`,
      data: {
        translate_text: text, 
      },
    },
  };
}