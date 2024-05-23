import React from 'react';
import { Button } from 'semantic-ui-react';


const GoogleTranslateButton = (props) => {
  const {node} = props

  return (
    <>
      <Button>Google Translate Button</Button>
      <div> <strong>Text to translate</strong>: {node?.textContent} </div>
    </>
  )
};

export default GoogleTranslateButton;
