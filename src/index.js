import React from 'react';
import ReactDOM from 'react-dom';
import { SpeechProvider } from '@speechly/react-client';

import { Provider } from './context/context';
import App from './App';
import './index.css';

ReactDOM.render(
    <Provider>
        <SpeechProvider appId="f593972b-7fcc-41a0-ac75-b3655a1daab0" language="en-US">
            <App />
        </SpeechProvider>
    </Provider>, document.getElementById('root')
);