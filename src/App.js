import React from 'react';
import './App.css';
import TenantFileGallery from './TenantFileGallery';
import logo from './logo.png'; // Make sure the path is correct
import FileUploadPage from './FileUploadPage';
import ManifestGenerator from "./ManifestGenerator";
import caifoj from "./cai-foj-800.png";


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="my.file.baby... MINE!" className={"responsive"}/>
        <TenantFileGallery />
          <ManifestGenerator />
        <FileUploadPage />
      </header>
        <footer className="footer">
            <p>
                <img src={caifoj} alt="Friends of Justin" className="responsive" />
            </p>
            <p>
                To inspect your content, use <a href="https://contentcredentials.org/verify" target="_blank" rel="noopener noreferrer">contentcredentials.org/verify</a>
            </p>
            <p>
                &copy; 2023-2024, <a href="https://friendsofjustin.knowbots.org">Friends of Justin</a>
            </p>
        </footer>

    </div>

  );
}

export default App;

