// client/src/components/UploadResume.jsx

import React, { useState } from 'react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await resumeAPI.upload(formData);
      const resume = res.data.data.resume; // unwrap payload
      setResult(resume);
      toast.success('Analysis Complete');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Resume Analyzer</h2>

      {!result && (
        <>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-4"
          />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Analysis Results</h3>
          <p><strong>Original File:</strong> {result.originalFileName}</p>
          <p><strong>Text Length:</strong> {result.textLength} characters</p>
          <p>
            <strong>Sections Found:</strong>{' '}
            {result.sectionsFound?.length
              ? result.sectionsFound.join(', ')
              : 'N/A'}
          </p>

          <div>
            <h4 className="font-semibold">Skills</h4>
            <p>
              Technical:{' '}
              {result.analysis?.skills?.technical?.length
                ? result.analysis.skills.technical.join(', ')
                : 'N/A'}
            </p>
            <p>
              Soft:{' '}
              {result.analysis?.skills?.soft?.length
                ? result.analysis.skills.soft.join(', ')
                : 'N/A'}
            </p>
            <p>
              Tools:{' '}
              {result.analysis?.skills?.tools?.length
                ? result.analysis.skills.tools.join(', ')
                : 'N/A'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Experience</h4>
            <p>
              Total Years:{' '}
              {result.analysis?.experience?.totalYears ?? 'N/A'}
            </p>
            <p>
              Roles:{' '}
              {result.analysis?.experience?.roles?.length
                ? result.analysis.experience.roles.join(', ')
                : 'N/A'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Education</h4>
            <p>
              Degrees:{' '}
              {result.analysis?.education?.degrees?.length
                ? result.analysis.education.degrees.join(', ')
                : 'N/A'}
            </p>
            <p>
              Institutions:{' '}
              {result.analysis?.education?.institutions?.length
                ? result.analysis.education.institutions.join(', ')
                : 'N/A'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Recommendations</h4>
            {result.analysis?.recommendations?.length ? (
              <ul className="list-disc pl-5">
                {result.analysis.recommendations.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>

          <button
            onClick={() => {
              setResult(null);
              setFile(null);
            }}
            className="btn-secondary mt-4"
          >
            Analyze Another
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
