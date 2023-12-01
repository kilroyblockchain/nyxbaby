import React from 'react';
import './App.css';
import TenantFileGallery from './TenantFileGallery';
import logo from './logo.png'; // Make sure the path is correct
import FileUploadPage from './FileUploadPage';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="my.file.baby... MINE!" className={"responsive"}/>
        <TenantFileGallery />
        <FileUploadPage />
      </header>
    </div>
  );
}

export default App;

