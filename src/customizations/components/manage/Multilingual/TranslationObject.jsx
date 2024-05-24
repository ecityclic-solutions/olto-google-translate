import React, { useEffect, useState, useRef  } from 'react';
import ReactDOM from 'react-dom'
import { map } from 'lodash';
import { defineMessages, useIntl } from 'react-intl';
import { Form as UiForm, Menu, Segment } from 'semantic-ui-react';
import { Provider } from 'react-intl-redux';
import { Form, Field } from '@plone/volto/components';
import config from '@plone/volto/registry';
import configureStore from '@plone/volto/store';
import {
  Api,
  flattenToAppURL,
  langmap,
  toGettextLang,
  toReactIntlLang,
} from '@plone/volto/helpers';
import { createBrowserHistory } from 'history';
const messages = defineMessages({
  document: {
    id: 'Document',
    defaultMessage: 'Document',
  },
});
import { GoogleTranslateButton } from '../../../../components';

const TranslationObject = ({
  translationObject,
  schema,
  pathname,
  visual,
  isFormSelected,
  onSelectForm,
}) => {
  const intl = useIntl();

  const [locales, setLocales] = useState({});
  const [loadingLocale, setLoadingLocale] = useState(false);
  const [activeMenu, setActiveMenu] = useState('language');
  const handleMenuClick = (e, { name }) => {
    setActiveMenu(name);
    addGoogleTranslateButtons();
  };

  useEffect(() => {
    if (
      !loadingLocale &&
      Object.keys(locales).length < config.settings.supportedLanguages.length
    ) {
      setLoadingLocale(true);
      let lang =
        config.settings.supportedLanguages[Object.keys(locales).length];
      const langFileName = toGettextLang(lang);
      import('@root/../locales/' + langFileName + '.json').then((locale) => {
        setLocales({ ...locales, [toReactIntlLang(lang)]: locale.default });
        setLoadingLocale(false);
      });
    }
  }, [loadingLocale, locales]);

  const api = new Api();
  const history = createBrowserHistory();
  const store = configureStore(
    {
      ...window.__data,
      intl: {
        defaultLocale: config.settings.defaultLanguage,
        locale: translationObject.language.token,
        messages: locales[translationObject.language.token],
      },
    },
    history,
    api,
  );

  const lang = translationObject.language.token;

  const formWrapperRef = useRef(null);
  const addingButtonsInterval = useRef();

  const addGoogleTranslateButton = (node) => {
    if (node.classList.contains('block-translatable')) return;
    node.classList.add('block-translatable')

    if (!node.textContent) return;

    var div = document.createElement('div');
    ReactDOM.render(
       <GoogleTranslateButton node={node} container={div} intl={intl} />,
       node.appendChild(div)
    );
  }

  const addGoogleTranslateButtonsInner = () => {
    const blocks = document.querySelectorAll(".source-object .block-editor-slate")
    for (const block of blocks) {
      addGoogleTranslateButton(block)
    }
  }

  const addGoogleTranslateButtons = () => {
    let intervalIterations = 0
    clearInterval(addingButtonsInterval.current)
    addingButtonsInterval.current = setInterval(function() {
      const blocks = document.querySelectorAll(".source-object .block-editor-slate")
      if (blocks.length > 0 || intervalIterations > 100) {
        addGoogleTranslateButtonsInner()
        clearInterval(addingButtonsInterval.current)
      } else {
        intervalIterations += 1
      }
    }, 200)
  }

  useEffect(() => {
    addGoogleTranslateButtons()
    const formWrapper = formWrapperRef.current;
    let iterations = 0

    if (!formWrapper) return;

    const observer = new MutationObserver((mutationsList) => {
      iterations += 1
      if (iterations > 5) return;
      for (let mutation of mutationsList) {
        addGoogleTranslateButtons()
      }
    });
    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(formWrapper, config);

    return () => {
      observer.disconnect();
      clearInterval(addingButtonsInterval.current)
    };
  }, []);

  return translationObject ? (
    <Provider store={store}>
      <>
        <Menu pointing secondary attached tabular>
          <Menu.Item
            name="language"
            active={activeMenu === 'language'}
            onClick={handleMenuClick}
          >
            {langmap[lang].nativeName}
          </Menu.Item>
          {visual && (
            <Menu.Item
              name="properties"
              active={activeMenu === 'properties'}
              onClick={handleMenuClick}
            >
              {intl.formatMessage(messages.document)}
            </Menu.Item>
          )}
        </Menu>
        {activeMenu === 'language' && (
          <div ref={formWrapperRef}>
          <Form
            key="translation-object-form"
            schema={schema}
            formData={translationObject}
            type={translationObject['@type']}
            onSubmit={() => {
              /*do nothing*/
            }}
            hideActions
            pathname={flattenToAppURL(translationObject['@id'])}
            visual={visual}
            title={langmap[lang].nativeName}
            isFormSelected={isFormSelected}
            onSelectForm={onSelectForm}
            editable={false}
            onChange={() => {}}
          />
          </div>
        )}
        {activeMenu === 'properties' && (
          <UiForm method="post" onSubmit={() => {}}>
            <fieldset className="invisible">
              {schema &&
                map(schema.fieldsets, (item) => [
                  <Segment secondary attached key={item.title}>
                    {item.title}
                  </Segment>,
                  <Segment attached key={`fieldset-contents-${item.title}`}>
                    {map(item.fields, (field, index) => (
                      <>
                      <Field
                        {...schema.properties[field]}
                        isDisabled={true}
                        id={field}
                        formData={translationObject}
                        focus={false}
                        value={translationObject[field]}
                        required={schema.required.indexOf(field) !== -1}
                        key={field}
                        onChange={() => {}}
                      />
                      {(item?.id === 'default' && schema.properties[field]?.type === 'string' && translationObject[field]) && (
                        <GoogleTranslateButton value={translationObject[field]} intl={intl} />
                      )}
                      </>
                    ))}
                  </Segment>,
                ])}
            </fieldset>
          </UiForm>
        )}
      </>
    </Provider>
  ) : null;
};

export default TranslationObject;
