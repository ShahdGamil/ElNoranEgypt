import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css'; // must load before component styles so they can override it
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
