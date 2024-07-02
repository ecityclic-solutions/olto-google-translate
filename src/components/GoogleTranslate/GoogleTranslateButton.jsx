import React from 'react';
import { useState, useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { defineMessages } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { Api } from '@plone/volto/helpers';
import configureStore from '@plone/volto/store';
import { createBrowserHistory } from 'history';
import { getGoogleTranslateText } from '../../actions';
import GTranslateImg from './img/gtranslate.png';
import { useEditorContext } from '@plone/volto-slate/hooks';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';


const messages = defineMessages({
  translate: {
    id: 'translate',
    defaultMessage: 'translate',
  },
});


const InnerGoogleTranslateButton = ({node = false, fieldId = false, value = false, sourceLang, targetLang, intl, translationObject}) => {
  const dispatch = useDispatch();
  const translatedText = useSelector((state) => state?.google_translate?.translated_text);
  const state = useSelector((state) => state);
  const [translation, setTranslation] = useState(0);

  useEffect(() => {
    console.log('Text 2 translate:', translatedText)
    if (translatedText) {
      applyTranslation();
      console.log('-----------------------')
      console.log('-----------------------')
    }
  }, [translatedText, translation]);

  const translate = () => {
    if (node) {
      const textNode = node.getElementsByClassName('block slate')[0].getElementsByTagName('p')[0];
      const nodeId = node.getAttribute('data-rbd-draggable-id');
      const nodeValue = translationObject?.blocks?.[nodeId]?.value

      if (!nodeValue) return;
      // dispatch(getGoogleTranslateText(textNode.innerHTML, sourceLang, targetLang)).then(setTranslation(translation + 1));
      dispatch(getGoogleTranslateText(nodeValue, sourceLang, targetLang)).then(setTranslation(translation + 1));
    }

    if (value) {
      dispatch(getGoogleTranslateText(value, sourceLang, targetLang)).then(setTranslation(translation + 1));
    }
  };

  const applyTranslation = () => {
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
      console.warning('No target block')
    }

    const slateEditor = targetBlock.querySelectorAll('p')[0].parentNode
    const targetText = targetBlock.querySelectorAll('p')[0]
    const textArea = targetBlock.querySelectorAll('textarea')[0]

    const textareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    textareaSetter.call(field, translatedText);
    field.dispatchEvent(new Event('input', { bubbles: true }));

    // console.log('Editors', editors)
    // console.log('slateEditor', slateEditor)

    // console.log('editor', editor.current)
    // console.log('children', editor.current.children)
    // const point = { path: [0, 0], offset: 0 }
    // editor.current.selection = { anchor: point, focus: point };
    // editor.current.history = { redos: [], undos: [] }; 
    // editor.current.children = [{
    //     type: "p",
    //     children: [{ text: "" }]
    // }];


    // editor.current.children = translatedText
    // console.log('children', editor.current.children)


    // let editor = ReactEditor.findKey(node)
    // console.log(editor)
    // let editor2 = ReactEditor.findKey(node, node)
    // console.log(editor2)

    // slateEditor.focus()
    // slateEditor.dispatchEvent(new KeyboardEvent('keydown', {'key': 'a'}));

    // document.execCommand('insertText', false, '-added-1');
    // slateEditor.dispatchEvent(new Event('input', {data: '-added', inputType: 'testing', bubbles: true}));
    // slateEditor.dispatchEvent(new Event('textInput', {data: '-added2', inputType: 'testing', bubbles: true}));
    // targetText.dispatchEvent(new Event('input', {data: '-added3', inputType: 'testing', bubbles: true}));
    // targetText.dispatchEvent(new Event('textInput', {data: '-added4', inputType: 'testing', bubbles: true}));

    // const targetText = targetBlock.querySelectorAll('p')[0]
    // targetText.innerHTML = translatedText
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
      <span className="ui button" onClick={translate}>
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
