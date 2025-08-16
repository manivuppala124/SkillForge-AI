// const Resume = require('../models/Resume')
// const User = require('../models/User')
// const { uploadToFirebase } = require('../services/fileService')
// const { analyzeResumeWithAI } = require('../services/perplexityService')
// const Helpers = require('../utils/helpers')
// const PDFParser = require('pdf2json')

// // @desc    Upload and analyze resume
// // @route   POST /api/resume/upload
// const uploadResume = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json(
//         Helpers.formatResponse(false, null, 'No file uploaded')
//       )
//     }

//     // Validate file
//     Helpers.validateFileUpload(req.file, ['application/pdf'], 10 * 1024 * 1024) // 10MB limit

//     const userId = req.user.id
//     const targetRole = req.body.targetRole || null

//     console.log(`📄 Processing resume upload for user ${userId}: ${req.file.originalname}`)

//     // Upload to Firebase Storage
//     const fileURL = await uploadToFirebase(req.file, `resumes/${userId}`)

//     // Extract text from PDF
//     const extractedText = await extractTextFromPDF(req.file.buffer)

//     if (!extractedText || extractedText.length < 100) {
//       return res.status(400).json(
//         Helpers.formatResponse(false, null, 'Could not extract meaningful text from PDF. Please ensure your resume contains readable text.')
//       )
//     }

//     // Create resume record with processing status
//     const resume = new Resume({
//       userId,
//       fileName: req.file.originalname,
//       fileURL,
//       extractedText,
//       analysis: {
//         skills: { identified: [], missing: [], categories: [] },
//         experience: {},
//         education: {},
//         jobSuggestions: [],
//         recommendations: [],
//         score: { overall: 0, sections: {} },
//         aiInsights: { strengths: [], improvements: [], marketTrends: [] }
//       },
//       status: 'processing'
//     })

//     await resume.save()

//     // Analyze with AI asynchronously
//     try {
//       console.log(`🤖 Starting AI analysis for resume ${resume._id}`)
//       const analysis = await analyzeResumeWithAI(extractedText, targetRole)
      
//       // Update resume with analysis
//       resume.analysis = analysis
//       resume.status = 'completed'
//       await resume.save()

//       console.log(`✅ Resume analysis completed for ${resume._id}`)
//     } catch (analysisError) {
//       console.error('Resume analysis error:', analysisError)
//       resume.status = 'failed'
//       await resume.save()
//     }

//     res.json(
//       Helpers.formatResponse(true, {
//         resume: {
//           id: resume._id,
//           fileName: resume.fileName,
//           status: resume.status,
//           analysis: resume.analysis,
//           createdAt: resume.createdAt
//         }
//       }, 'Resume uploaded successfully. Analysis in progress.')
//     )
//   } catch (error) {
//     console.error('Upload resume error:', error)
    
//     if (error.message.includes('Invalid file type')) {
//       return res.status(400).json(
//         Helpers.formatResponse(false, null, error.message)
//       )
//     }

//     res.status(500).json(
//       Helpers.formatResponse(false, null, 'Error processing resume', error.message)
//     )
//   }
// }

// // @desc    Analyze resume text directly
// // @route   POST /api/resume/analyze
// const analyzeResume = async (req, res) => {
//   try {
//     const { resumeText, targetRole } = req.body
//     const userId = req.user.id

//     if (!resumeText) {
//       return res.status(400).json(
//         Helpers.formatResponse(false, null, 'Resume text is required')
//       )
//     }

//     if (resumeText.length < 100) {
//       return res.status(400).json(
//         Helpers.formatResponse(false, null, 'Resume text is too short. Please provide a complete resume.')
//       )
//     }

//     console.log(`📝 Processing direct resume analysis for user ${userId}`)

//     // Create resume record
//     const resume = new Resume({
//       userId,
//       fileName: 'Text Input',
//       fileURL: null,
//       extractedText: resumeText,
//       status: 'processing',
//       analysis: {
//         skills: { identified: [], missing: [], categories: [] },
//         experience: {},
//         education: {},
//         jobSuggestions: [],
//         recommendations: [],
//         score: { overall: 0, sections: {} },
//         aiInsights: { strengths: [], improvements: [], marketTrends: [] }
//       }
//     })

//     await resume.save()

//     try {
//       // Analyze with AI
//       const analysis = await analyzeResumeWithAI(resumeText, targetRole)
      
//       // Update resume with analysis
//       resume.analysis = analysis
//       resume.status = 'completed'
//       await resume.save()

//       console.log(`✅ Resume analysis completed for ${resume._id}`)

//       res.json(
//         Helpers.formatResponse(true, {
//           resume: {
//             id: resume._id,
//             fileName: resume.fileName,
//             status: resume.status,
//             analysis: resume.analysis,
//             createdAt: resume.createdAt
//           }
//         }, 'Resume analyzed successfully')
//       )
//     } catch (analysisError) {
//       console.error('Resume analysis error:', analysisError)
//       resume.status = 'failed'
//       await resume.save()

//       res.status(500).json(
//         Helpers.formatResponse(false, null, 'Error analyzing resume', analysisError.message)
//       )
//     }
//   } catch (error) {
//     console.error('Analyze resume error:', error)
//     res.status(500).json(
//       Helpers.formatResponse(false, null, 'Error processing resume analysis', error.message)
//     )
//   }
// }

// // @desc    Get resume analysis
// // @route   GET /api/resume/analysis/:userId
// const getAnalysis = async (req, res) => {
//   try {
//     const userId = req.params.userId
//     const { latest = true, resumeId } = req.query

//     // Validate user access
//     if (userId !== req.user.id.toString()) {
//       return res.status(403).json(
//         Helpers.formatResponse(false, null, 'Access denied')
//       )
//     }

//     let resume
//     if (resumeId) {
//       // Get specific resume
//       resume = await Resume.findOne({ _id: resumeId, userId })
//     } else if (latest) {
//       // Get latest resume
//       resume = await Resume.findOne({ userId }).sort({ createdAt: -1 })
//     }

//     if (!resume) {
//       return res.status(404).json(
//         Helpers.formatResponse(false, null, 'No resume analysis found')
//       )
//     }

//     res.json(
//       Helpers.formatResponse(true, {
//         resume: {
//           id: resume._id,
//           fileName: resume.fileName,
//           status: resume.status,
//           analysis: resume.analysis,
//           createdAt: resume.createdAt,
//           processingTime: resume.processingTime
//         }
//       }, 'Resume analysis retrieved successfully')
//     )
//   } catch (error) {
//     console.error('Get analysis error:', error)
//     res.status(500).json(
//       Helpers.formatResponse(false, null, 'Server error', error.message)
//     )
//   }
// }

// // @desc    Get all resumes for user
// // @route   GET /api/resume/list/:userId
// const getResumeList = async (req, res) => {
//   try {
//     const userId = req.params.userId
//     const { page = 1, limit = 10 } = req.query

//     // Validate user access
//     if (userId !== req.user.id.toString()) {
//       return res.status(403).json(
//         Helpers.formatResponse(false, null, 'Access denied')
//       )
//     }

//     const resumes = await Resume.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .select('fileName status analysis.score.overall createdAt processingTime')

//     const total = await Resume.countDocuments({ userId })

//     res.json(
//       Helpers.formatResponse(true, {
//         resumes,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(total / limit),
//           totalItems: total,
//           hasNext: page * limit < total,
//           hasPrev: page > 1
//         }
//       }, 'Resume list retrieved successfully')
//     )
//   } catch (error) {
//     console.error('Get resume list error:', error)
//     res.status(500).json(
//       Helpers.formatResponse(false, null, 'Server error', error.message)
//     )
//   }
// }

// // @desc    Delete resume
// // @route   DELETE /api/resume/:resumeId
// const deleteResume = async (req, res) => {
//   try {
//     const { resumeId } = req.params
//     const userId = req.user.id

//     const resume = await Resume.findOneAndDelete({ _id: resumeId, userId })

//     if (!resume) {
//       return res.status(404).json(
//         Helpers.formatResponse(false, null, 'Resume not found')
//       )
//     }

//     // Delete file from Firebase if exists
//     if (resume.fileURL) {
//       try {
//         const { deleteFromFirebase } = require('../services/fileService')
//         await deleteFromFirebase(resume.fileURL)
//       } catch (deleteError) {
//         console.error('File deletion error:', deleteError)
//         // Continue even if file deletion fails
//       }
//     }

//     console.log(`🗑️ Resume deleted: ${resumeId}`)

//     res.json(
//       Helpers.formatResponse(true, null, 'Resume deleted successfully')
//     )
//   } catch (error) {
//     console.error('Delete resume error:', error)
//     res.status(500).json(
//       Helpers.formatResponse(false, null, 'Error deleting resume', error.message)
//     )
//   }
// }

// // @desc    Get resume analytics
// // @route   GET /api/resume/analytics/:userId
// const getResumeAnalytics = async (req, res) => {
//   try {
//     const userId = req.params.userId

//     // Validate user access
//     if (userId !== req.user.id.toString()) {
//       return res.status(403).json(
//         Helpers.formatResponse(false, null, 'Access denied')
//       )
//     }

//     const analytics = await Resume.aggregate([
//       { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           totalResumes: { $sum: 1 },
//           averageScore: { $avg: '$analysis.score.overall' },
//           completedAnalyses: {
//             $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
//           },
//           averageProcessingTime: { $avg: '$processingTime' },
//           skillsIdentified: {
//             $push: '$analysis.skills.identified'
//           }
//         }
//       }
//     ])

//     const result = analytics[0] || {
//       totalResumes: 0,
//       averageScore: 0,
//       completedAnalyses: 0,
//       averageProcessingTime: 0,
//       skillsIdentified: []
//     }

//     // Flatten and count skills
//     const allSkills = result.skillsIdentified.flat()
//     const skillCount = {}
//     allSkills.forEach(skill => {
//       skillCount[skill] = (skillCount[skill] || 0) + 1
//     })

//     const topSkills = Object.entries(skillCount)
//       .sort(([,a], [,b]) => b - a)
//       .slice(0, 10)
//       .map(([skill, count]) => ({ skill, count }))

//     res.json(
//       Helpers.formatResponse(true, {
//         analytics: {
//           summary: {
//             totalResumes: result.totalResumes,
//             completedAnalyses: result.completedAnalyses,
//             averageScore: Math.round(result.averageScore || 0),
//             averageProcessingTime: Math.round(result.averageProcessingTime || 0)
//           },
//           topSkills
//         }
//       }, 'Resume analytics retrieved successfully')
//     )
//   } catch (error) {
//     console.error('Get resume analytics error:', error)
//     res.status(500).json(
//       Helpers.formatResponse(false, null, 'Server error', error.message)
//     )
//   }
// }

// // Helper function to extract text from PDF
// const extractTextFromPDF = (buffer) => {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser()

//     pdfParser.on('pdfParser_dataError', (errData) => {
//       reject(new Error(`PDF parsing error: ${errData.parserError}`))
//     })

//     pdfParser.on('pdfParser_dataReady', (pdfData) => {
//       try {
//         const text = pdfParser.getRawTextContent()
//         resolve(text.trim())
//       } catch (extractError) {
//         reject(new Error(`Text extraction error: ${extractError.message}`))
//       }
//     })

//     try {
//       pdfParser.parseBuffer(buffer)
//     } catch (parseError) {
//       reject(new Error(`PDF buffer parsing error: ${parseError.message}`))
//     }
//   })
// }

// module.exports = { 
//   uploadResume, 
//   analyzeResume, 
//   getAnalysis,
//   getResumeList,
//   deleteResume,
//   getResumeAnalytics
// }
// server/controllers/resumeController.js
// server/controllers/resumeController.js
// server/controllers/resumeController.js
const Resume = require('../models/Resume');
const { analyzeResumeWithAI } = require('../services/perplexityService');
const { extractTextFromPDF, parseResumeSections } = require('../utils/pdfProcessor'); // Fixed import name
const Helpers = require('../utils/helpers');

const uploadAndAnalyzeResume = async (req, res) => {
  try {
    if (!req.uploadedFile) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'No file uploaded')
      );
    }

    const { originalName, fileName, filePath, size } = req.uploadedFile;
    const userId = req.user.id;

    console.log(`🔍 Starting resume analysis for user ${userId}`);

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(filePath);
    
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json(
        Helpers.formatResponse(false, null, 'Could not extract meaningful text from PDF. Please ensure the PDF contains readable text.')
      );
    }

    console.log(`📄 Text extracted: ${resumeText.length} characters`);

    // Parse resume sections
    const parsedSections = parseResumeSections(resumeText); // Fixed function call

    // Analyze with AI
    console.log(`🤖 Sending resume to AI for analysis...`);
    const analysis = await analyzeResumeWithAI(resumeText);

    // Save to database
    const resume = new Resume({
      userId,
      originalFileName: originalName,
      storedFileName: fileName,
      filePath: filePath,
      fileSize: size,
      extractedText: resumeText,
      parsedSections: parsedSections,
      analysis: analysis,
      uploadedAt: new Date()
    });

    await resume.save();
    console.log(`✅ Resume saved to database: ${resume._id}`);

    // Return analysis (don't include file path for security)
    const response = {
      id: resume._id,
      originalFileName: originalName,
      fileSize: size,
      uploadedAt: resume.uploadedAt,
      textLength: resumeText.length,
      sectionsFound: Object.keys(parsedSections).filter(key => parsedSections[key]),
      analysis: analysis
    };

    res.json(
      Helpers.formatResponse(true, { resume: response }, 'Resume analyzed successfully')
    );

  } catch (error) {
    console.error('Resume upload/analysis error:', error);
    
    // Clean up uploaded file on error
    if (req.uploadedFile?.filePath) {
      const { deleteFile } = require('../services/fileService');
      await deleteFile(req.uploadedFile.filePath).catch(console.error);
    }
    
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error processing resume', error.message)
    );
  }
};

const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({ 
      _id: resumeId, 
      userId,
      isActive: true 
    }).select('-extractedText -filePath'); // Exclude sensitive data

    if (!resume) {
      return res.status(404).json(
        Helpers.formatResponse(false, null, 'Resume not found')
      );
    }

    res.json(
      Helpers.formatResponse(true, { resume }, 'Resume retrieved successfully')
    );
    
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error retrieving resume', error.message)
    );
  }
};

const getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const resumes = await Resume.find({ 
      userId,
      isActive: true 
    })
    .select('-extractedText -filePath -parsedSections') // Exclude large fields
    .sort({ uploadedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Resume.countDocuments({ userId, isActive: true });

    res.json(
      Helpers.formatResponse(true, {
        resumes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }, 'Resumes retrieved successfully')
    );
    
  } catch (error) {
    console.error('Get user resumes error:', error);
    res.status(500).json(
      Helpers.formatResponse(false, null, 'Error retrieving resumes', error.message)
    );
  }
};

module.exports = {
  uploadAndAnalyzeResume,
  getResumeById,
  getUserResumes
};
