import React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import { defineMessages } from 'react-intl';
import { Button } from 'semantic-ui-react';
import { Api } from '@plone/volto/helpers';
import configureStore from '@plone/volto/store';
import { createBrowserHistory } from 'history';
import { getGoogleTranslateText } from '../../actions';
import GTranslateImg from './img/gtranslate.png';


const messages = defineMessages({
  translate: {
    id: 'translate',
    defaultMessage: 'translate',
  },
});


const InnerGoogleTranslateButton = ({ node = false, value = false, intl}) => {
  const dispatch = useDispatch();
  const translatedText = useSelector((state) => state?.google_translate?.translated_text);

  useEffect(() => {
    // console.log('Text translated', translatedText)
  }, [translatedText]);

  const translate = () => {
    if (node) {
      const textNode = node.getElementsByClassName('block slate')[0].getElementsByTagName('p')[0];
      if (!textNode) return;
      dispatch(getGoogleTranslateText(textNode.outerHTML));
    }

    if (value) {
      dispatch(getGoogleTranslateText(value));
    }
  };

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
