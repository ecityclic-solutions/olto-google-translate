import React from 'react';
import { useState, useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { defineMessages } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { Api } from '@plone/volto/helpers';
import configureStore from '@plone/volto/store';
import { createBrowserHistory } from 'history';
import { getGoogleTranslateText } from '../../actions';
import { toast } from 'react-toastify';
import { Toast } from '@plone/volto/components';
import GTranslateImg from './img/gtranslate.png';


const messages = defineMessages({
  translate: {
    id: 'translate',
    defaultMessage: 'translate',
  },
  noMoreQuote: {
    id: 'Quota exhausted',
    defaultMessage: 'Quota exhausted',
  },
  noMoreQuoteDescription: {
    id: 'Quota of Google Translate API exhausted',
    defaultMessage: 'Quota of Google Translate API exhausted',
  },
  noBlockFound: {
    id: 'No Block found',
    defaultMessage: 'No Block found',
  },
  noBlockFoundDescription: {
    id: 'No Block found to apply the translation. This means there is no text block in the same position',
    defaultMessage: 'No Block found to apply the translation. This means there is no text block in the same position',
  },
});


const InnerGoogleTranslateButton = ({node = false, fieldId = false, value = false, sourceLang, targetLang, intl, translationObject}) => {
  const dispatch = useDispatch();
  const translatedText = useSelector((state) => state?.google_translate?.translated_text);
  const state = useSelector((state) => state);
  const [translation, setTranslation] = useState(0);

  useEffect(() => {
    if (translatedText) {
      applyTranslation();
    }
  }, [translatedText, translation]);

  const translate = () => {
    if (node) {
      const nodeId = node.getAttribute('data-rbd-draggable-id');
      const nodeValue = translationObject?.blocks?.[nodeId]?.value
      const blocks = document.querySelectorAll('.new-translation .blocks-form .block-editor-slate')
      const nodeIndex = getNodeIndex(node)
      const targetBlock = blocks?.[nodeIndex]

      if (!nodeValue) return;

      if (!targetBlock) {
        toast.error(
          <Toast
            error
            title={intl.formatMessage(messages.noBlockFound)}
            content={intl.formatMessage(messages.noBlockFoundDescription)}
          />,
        );
        return
      }

      dispatch(getGoogleTranslateText(nodeValue, sourceLang, targetLang)).then(setTranslation(translation + 1));
    }

    if (value) {
      dispatch(getGoogleTranslateText(value, sourceLang, targetLang)).then(setTranslation(translation + 1));
    }
  };

  const applyTranslation = () => {
    if (translatedText?.error) {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.noMoreQuote)}
          content={intl.formatMessage(messages.noMoreQuoteDescription)}
        />,
      );
      return
    }

    if (node) {
      applyTranslationNode()
    } else {
      applyTranslationField()
    }
  }

  const applyTranslationNode = () => {
    const blocks = document.querySelectorAll('.new-translation .blocks-form .block-editor-slate')
    const nodeIndex = getNodeIndex(node)
    const targetBlock = blocks?.[nodeIndex]
    if (!targetBlock) {
      toast.error(
        <Toast
          error
          title={intl.formatMessage(messages.noBlockFound)}
          content={intl.formatMessage(messages.noBlockFoundDescription)}
        />,
      );
      return
    }

    const field = targetBlock.querySelectorAll('textarea')[0]
    const textareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    textareaSetter.call(field, '');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    textareaSetter.call(field, JSON.stringify(translatedText));
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  const applyTranslationField = () => {
    const field = document.querySelectorAll(`#sidebar-metadata #field-${fieldId}`)?.[0]
    if (!field) return

    if (field instanceof HTMLInputElement) {
      const inputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      inputSetter.call(field, translatedText);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (field instanceof HTMLTextAreaElement) {
      const textareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      textareaSetter.call(field, translatedText);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  const getNodeIndex = (node) => {
    const parent = node.parentNode;
    const children = Array.from(parent.children).filter(child => child.classList.contains('block-translatable'));
    for (let i = 0; i < children.length; i++) {
      if (children[i] === node) {
        return i;
      }
    }
    return -1;
  }

  return (
    <>
      <span className="googleTranslateButton ui button" onClick={translate}>
        <img  src={GTranslateImg} alt={intl.formatMessage(messages.translate)}/>
      </span>
    </>
  )
};


const GoogleTranslateButton = (props) => {
  const api = new Api();
  const history = createBrowserHistory();
  const store = configureStore(
    {
      ...window.__data,
    },
    history,
    api,
  );

  return (
    <>
      <Provider store={store}>
        <InnerGoogleTranslateButton {...props} />
      </Provider>
    </>
  )
};

export default GoogleTranslateButton;
