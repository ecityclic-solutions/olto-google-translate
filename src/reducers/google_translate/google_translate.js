/**
 * Google translate reducer.
 * @module reducers/google_translate
 */

import { GET_GOOGLE_TRANSLATE_TEXT } from '../../constants/ActionTypes';

const initialState = {
  error: null,
  loaded: false,
  loading: false,
  translated_text: null,
};

export default function google_translate(state = initialState, action = {}) {
  switch (action?.type) {
    case `${GET_GOOGLE_TRANSLATE_TEXT}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };
    case `${GET_GOOGLE_TRANSLATE_TEXT}_FAIL`:
      return {
        ...state,
        error: action.error,
        loaded: false,
        loading: false,
      };

    case `${GET_GOOGLE_TRANSLATE_TEXT}_SUCCESS`:
      return {
        ...state,
        error: null,
        loaded: true,
        loading: false,
        translated_text: action.result.translated_text,
      };
    default:
      return state;
  }
};