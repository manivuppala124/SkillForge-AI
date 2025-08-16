import PyPDF2
import io
from typing import Dict, Any, List
import re
import logging

logger = logging.getLogger(__name__)

class PDFParser:
    """PDF parsing utility for extracting text from PDF documents."""

    @staticmethod
    def extract_text_from_buffer(pdf_buffer: bytes) -> str:
        """
        Extract text from an in‑memory PDF buffer.
        """
        try:
            pdf_file = io.BytesIO(pdf_buffer)
            pdf_reader = PyPDF2.PdfReader(pdf_file)

            if len(pdf_reader.pages) == 0:
                raise Exception("PDF file is empty or corrupted")

            text_parts = []
            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text() or ""
                    if page_text.strip():
                        text_parts.append(page_text)
                except Exception as page_error:
                    logger.warning(f"Failed to extract text from page {page_num + 1}: {page_error}")

            if not text_parts:
                raise Exception("No text could be extracted from the PDF")

            return PDFParser._clean_extracted_text("\n".join(text_parts))

        except PyPDF2.errors.PdfReadError as pdf_error:
            raise Exception(f"PDF file is invalid: {pdf_error}")
        except Exception as e:
            raise Exception(f"PDF parsing failed: {e}")

    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """Extract text from a PDF file on disk."""
        try:
            with open(file_path, 'rb') as f:
                return PDFParser.extract_text_from_buffer(f.read())
        except FileNotFoundError:
            raise Exception(f"PDF file not found: {file_path}")
        except PermissionError:
            raise Exception(f"Permission denied: {file_path}")
        except Exception as e:
            raise Exception(f"Failed to read PDF file: {e}")

    @staticmethod
    def _clean_extracted_text(text: str) -> str:
        """Clean up extracted text."""
        if not text:
            return ""
        text = re.sub(r'\n\s*\n', '\n\n', text)  # compress blank lines
        text = re.sub(r' +', ' ', text)          # compress spaces
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        text = text.replace('\f', '\n')
        text = re.sub(r'(?<=[a-z])\n(?=[a-z])', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        return text.strip()

    @staticmethod
    def extract_metadata(pdf_buffer: bytes) -> Dict[str, Any]:
        """Extract metadata from a PDF."""
        try:
            pdf_file = io.BytesIO(pdf_buffer)
            reader = PyPDF2.PdfReader(pdf_file)

            metadata = {
                'pages': len(reader.pages),
                'encrypted': reader.is_encrypted
            }

            if reader.metadata:
                doc_info = reader.metadata
                metadata.update({
                    'title': doc_info.get('/Title', ''),
                    'author': doc_info.get('/Author', ''),
                    'subject': doc_info.get('/Subject', ''),
                    'creator': doc_info.get('/Creator', ''),
                    'producer': doc_info.get('/Producer', ''),
                    'creation_date': str(doc_info.get('/CreationDate', '')),
                    'modification_date': str(doc_info.get('/ModDate', ''))
                })

            return metadata
        except Exception as e:
            logger.error(f"Failed to extract PDF metadata: {e}")
            return {'pages': 0, 'encrypted': False, 'error': str(e)}

    @staticmethod
    def validate_pdf(pdf_buffer: bytes) -> Dict[str, Any]:
        """Validate a PDF file."""
        validation = {
            'is_valid': False,
            'is_readable': False,
            'has_text': False,
            'page_count': 0,
            'file_size': len(pdf_buffer),
            'errors': []
        }
        try:
            pdf_file = io.BytesIO(pdf_buffer)
            reader = PyPDF2.PdfReader(pdf_file)
            validation['is_valid'] = True
            validation['page_count'] = len(reader.pages)

            if validation['page_count'] > 0:
                validation['is_readable'] = True
                sample_text = ""
                for i in range(min(3, validation['page_count'])):
                    page_text = reader.pages[i].extract_text() or ""
                    sample_text += page_text
                    if len(sample_text.strip()) > 50:
                        validation['has_text'] = True
                        break

            if reader.is_encrypted:
                validation['errors'].append("PDF is encrypted")

        except PyPDF2.errors.PdfReadError as e:
            validation['errors'].append(f"PDF read error: {e}")
        except Exception as e:
            validation['errors'].append(f"Validation error: {e}")

        return validation

    @staticmethod
    def extract_text_by_pages(pdf_buffer: bytes) -> List[str]:
        """
        Extract text from PDF as a list of strings, one per page.
        """
        try:
            pdf_file = io.BytesIO(pdf_buffer)
            reader = PyPDF2.PdfReader(pdf_file)
            pages_text = []
            for page_num in range(len(reader.pages)):
                try:
                    page_text = reader.pages[page_num].extract_text() or ""
                    pages_text.append(PDFParser._clean_extracted_text(page_text))
                except Exception as err:
                    logger.warning(f"Error extracting page {page_num + 1}: {err}")
                    pages_text.append("")
            return pages_text
        except Exception as e:
            raise Exception(f"PDF page extraction failed: {e}")
