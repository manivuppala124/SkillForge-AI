// server/utils/pdfProcessor.js
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`📄 Extracting text from PDF: ${filePath}`);
    
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse the PDF and extract text
    const pdfData = await pdfParse(dataBuffer);
    
    // Clean and format the extracted text
    const extractedText = cleanExtractedText(pdfData.text);
    
    console.log(`✅ Text extracted successfully. Length: ${extractedText.length} characters`);
    
    return extractedText;
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Clean and format extracted text
 * @param {string} rawText - Raw text from PDF
 * @returns {string} - Cleaned text
 */
const cleanExtractedText = (rawText) => {
  if (!rawText) return '';
  
  return rawText
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers and common headers/footers
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\d+\/\d+\/\d+/g, '') // Remove dates in header/footer
    // Clean up line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim whitespace
    .trim();
};

/**
 * Extract specific sections from resume text
 * @param {string} text - Full resume text
 * @returns {Object} - Parsed sections
 */
const parseResumeSections = (text) => {  // Fixed function name here
  const sections = {
    contact: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
    certifications: ''
  };

  try {
    // Simple section detection based on common resume patterns
    const lines = text.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      // Detect section headers
      if (lowerLine.includes('experience') || lowerLine.includes('work history')) {
        currentSection = 'experience';
        continue;
      } else if (lowerLine.includes('education') || lowerLine.includes('academic')) {
        currentSection = 'education';
        continue;
      } else if (lowerLine.includes('skill') || lowerLine.includes('technical')) {
        currentSection = 'skills';
        continue;
      } else if (lowerLine.includes('project')) {
        currentSection = 'projects';
        continue;
      } else if (lowerLine.includes('certification') || lowerLine.includes('certificate')) {
        currentSection = 'certifications';
        continue;
      } else if (lowerLine.includes('summary') || lowerLine.includes('objective')) {
        currentSection = 'summary';
        continue;
      }
      
      // Add content to current section
      if (currentSection && line.trim()) {
        sections[currentSection] += line + '\n';
      } else if (!currentSection && line.trim()) {
        // Assume early content is contact info
        sections.contact += line + '\n';
      }
    }
    
    // Clean up sections
    Object.keys(sections).forEach(key => {
      sections[key] = sections[key].trim();
    });
    
    return sections;
    
  } catch (error) {
    console.error('Error parsing resume sections:', error);
    return sections;
  }
};

/**
 * Validate PDF file
 * @param {Buffer} buffer - PDF file buffer
 * @returns {boolean} - Whether file is valid PDF
 */
const isValidPDF = async (buffer) => {
  try {
    await pdfParse(buffer);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get PDF metadata
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} - PDF metadata
 */
const getPDFMetadata = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    
    return {
      pages: pdfData.numpages,
      textLength: pdfData.text.length,
      version: pdfData.version || 'Unknown',
      info: pdfData.info || {}
    };
    
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    return null;
  }
};

module.exports = {
  extractTextFromPDF,
  cleanExtractedText,
  parseResumeSections, // Fixed export name here
  isValidPDF,
  getPDFMetadata
};
