import sys
from pypdf import PdfReader

def extract_text(pdf_path, out_file):
    out_file.write(f"--- Extracting from {pdf_path} ---\n")
    try:
        reader = PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                out_file.write(f"--- Page {i+1} ---\n")
                out_file.write(text + "\n")
    except Exception as e:
        out_file.write(f"Error reading {pdf_path}: {e}\n")

if __name__ == "__main__":
    with open("extracted_text_utf8.txt", "w", encoding="utf-8") as f:
        if len(sys.argv) > 1:
            for arg in sys.argv[1:]:
                extract_text(arg, f)
        else:
            f.write("Please provide PDF paths as arguments.\n")
