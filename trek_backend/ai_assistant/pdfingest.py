"""
ai_assistant/pdf_ingest.py

Extracts text from an admin-uploaded trek guide PDF and splits it into
overlapping chunks for RAG retrieval. No LangChain needed — just pypdf
for extraction and a small manual splitter.

Requires:
    pip install pypdf
"""

from pypdf import PdfReader
# from .pdf_ingest import extract_and_chunk_pdf


def extract_text(pdf_file) -> str:
    """pdf_file: an open file-like object (e.g. Django's request.FILES['file'])"""
    reader = PdfReader(pdf_file)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(pages)


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Simple sliding-window chunker — splits on paragraph breaks where possible,
    falls back to hard character slicing. Mirrors what LangChain's
    RecursiveCharacterTextSplitter does, without the dependency.
    """
    text = text.strip()
    if not text:
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks = []
    current = ""
    for para in paragraphs:
        if len(current) + len(para) + 1 <= chunk_size:
            current = f"{current}\n{para}".strip()
        else:
            if current:
                chunks.append(current)
            # paragraph itself longer than chunk_size -> hard slice it
            if len(para) > chunk_size:
                for i in range(0, len(para), chunk_size - chunk_overlap):
                    chunks.append(para[i:i + chunk_size])
                current = ""
            else:
                current = para

    if current:
        chunks.append(current)

    # apply overlap between adjacent chunks
    overlapped = []
    for i, chunk in enumerate(chunks):
        if i == 0:
            overlapped.append(chunk)
        else:
            prev_tail = chunks[i - 1][-chunk_overlap:]
            overlapped.append(f"{prev_tail}\n{chunk}")

    return overlapped


def extract_and_chunk_pdf(pdf_file, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    text = extract_text(pdf_file)
    return chunk_text(text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)