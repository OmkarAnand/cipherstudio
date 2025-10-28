import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { saveProject, loadProject } from "./api/api";
import { v4 as uuidv4 } from "uuid";

/*
  Minimal CipherStudio shell:
  - left: simple file list + add/delete
  - center: sandpack (editor + preview)
  - top: save/load
*/

const DEFAULT_PROJECT = {
  projectId: null,
  name: "cipher-project",
  files: {
    "/src/App.jsx": {
      code:
`import React from "react";
export default function App(){
  return <div style={{padding:20,fontFamily:"sans-serif"}}>
    <h1>CipherStudio — Hello World</h1>
    <p>Edit files on the left and see preview live.</p>
  </div>;
}`
    },
    "/src/index.jsx": {
      code:
`import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
const root = createRoot(document.getElementById("root"));
root.render(<App />);`
    },
    "/package.json": {
      code: JSON.stringify({
        name: "cipherstudio-sandbox",
        version: "1.0.0",
        main: "src/index.jsx",
        dependencies: {
          react: "18.2.0",
          "react-dom": "18.2.0"
        }
      }, null, 2)
    },
    "/index.html": {
      code:
`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CipherStudio Sandbox</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
    }
  },
  entry: "/src/index.jsx",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function keyFor(id){ return `cipherstudio:project:${id}`; }

export default function App(){
  const [project, setProject] = useState(() => {
    const newProj = {...DEFAULT_PROJECT};
    newProj.projectId = uuidv4();
    return newProj;
  });
  const [selected, setSelected] = useState("/src/App.jsx");
  const [fileList, setFileList] = useState(Object.keys(DEFAULT_PROJECT.files));
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFileList(Object.keys(project.files));
  }, [project.files]);

  function addFile(){
    const name = prompt("Enter new file path (e.g. /src/Hello.jsx):");
    if(!name) return;
    if(project.files[name]){
      alert("File exists");
      return;
    }
    const updated = {...project, files: {...project.files, [name]: { code: "// new file\n" }}};
    updated.updatedAt = new Date().toISOString();
    setProject(updated);
    setSelected(name);
  }

  function deleteFile(path){
    if(!window.confirm(`Delete ${path}?`)) return;
    const files = {...project.files};
    delete files[path];
    const updated = {...project, files, updatedAt: new Date().toISOString()};
    setProject(updated);
    setSelected(Object.keys(files)[0] || "");
  }

  function updateFile(path, code){
    const files = {...project.files, [path]: { code }};
    const updated = {...project, files, updatedAt: new Date().toISOString()};
    setProject(updated);
  }

  async function saveToDB() {
  try {
    const saved = await saveProject(project);
    setMessage("✅ Project saved to MongoDB: " + saved._id);
    setTimeout(() => setMessage(""), 2000);
  } catch (err) {
    console.error(err);
    setMessage("❌ Error saving to MongoDB");
  }
}


  async function loadFromDB() {
  const id = prompt("Enter MongoDB Project ID to load:");
  if (!id) return;

  try {
    const loaded = await loadProject(id);
    setProject(loaded);
    setMessage("✅ Project loaded from MongoDB");
    setTimeout(() => setMessage(""), 2000);
  } catch (err) {
    console.error(err);
    setMessage("❌ Error loading from MongoDB");
  }
}


  // Build Sandpack files object (Sandpack expects a flat files map)
  const sandpackFiles = {};
  for(const [path, meta] of Object.entries(project.files)){
    sandpackFiles[path] = meta.code;
  }



  return (
    <div style={{display:"grid", gridTemplateColumns:"260px 1fr 480px", height:"100vh", gap:10}}>
      <div style={{borderRight:"1px solid #ddd", padding:10}}>
        <h3>Files</h3>
        <button onClick={addFile}>+ New File</button>
        <button onClick={saveToDB} style={{ marginLeft: 8 }}>Save to DB</button>
        <button onClick={loadFromDB} style={{ marginLeft: 8 }}>Load from DB</button>

        <div style={{marginTop:10, fontSize:12, color:"#666"}}>{message}</div>
        <ul style={{marginTop:12, padding:0}}>
          {fileList.map(f => (
            <li key={f} style={{listStyle:"none", marginBottom:6, display:"flex", justifyContent:"space-between"}}>
              <span style={{cursor:"pointer", color: f===selected ? "blue":"black"}} onClick={()=>setSelected(f)}>{f}</span>
              <button onClick={()=>deleteFile(f)}>x</button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{padding:8}}>
        <h3>Editor — {selected}</h3>
        {selected ? (
          <Sandpack
            template="react"
            customSetup={{
              entry: project.entry.replace(/^\//,""), // sandpack friendly
              dependencies: {
                react: "18.2.0",
                "react-dom": "18.2.0"
              }
            }}
            files={sandpackFiles}
            options={{
              autorun: true,
              recompileMode: "immediate",
              activeFile: selected
            }}
            theme="light"
            style={{height:"86vh", border: "1px solid #e5e7eb"}}
            onFileChange={(path, code) => {
              // path arrives like "/src/App.jsx" for Sandpack
              updateFile(path, code);
            }}
          />
        ) : <div>Select a file to edit</div>}
      </div>
    </div>
  );
}
