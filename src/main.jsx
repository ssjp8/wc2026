import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App apiUrl={API_URL} />
  </React.StrictMode>,
)
