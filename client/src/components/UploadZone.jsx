import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";
function UploadZone() {
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("");
  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    setFileName(file.name);
    simulateAnalysis();
  };
  const simulateAnalysis = async () => {
    setUploading(true);
    setStep("Extracting Repository...");
    await wait(1500);
    setStep("Detecting Architecture...");
    await wait(1500);
    setStep("Scanning Security...");
    await wait(1500);
    setStep("Building Knowledge Graph...");
    await wait(1500);
    setStep("Generating CTO Report...");
    await wait(1500);
    setUploading(false);
  };
  function wait(ms) {
    return new Promise(
      resolve =>
        setTimeout(resolve, ms)
    );
  }
  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: {
      "application/zip": [".zip"]
    }
  });
  return (
    <section className="upload-section">
      <h2>
        Upload Repository</h2>
      <p>
        Upload ZIP file and let AI
        understand your entire codebase.
      </p>
      <div
        {...getRootProps()}
        className="dropzone">
        <input {...getInputProps()} />
        <FaCloudUploadAlt className="upload-icon" />

        <h3>
          Drag & Drop ZIP Here
        </h3>
        <span>
          or click to browse
        </span>
      </div>
      {fileName && (
        <div className="file-card">  <FaCheckCircle />
          {fileName}
        </div>
      )}
      {uploading && (
        <div className="analysis-box">
          <div className="loader"></div>
          <h4>{step}</h4>
        </div>
      )}
    </section>
  );
}
export default UploadZone;