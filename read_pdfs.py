import sys
from pypdf import PdfReader

def extract_text(pdf_path):
    print(f"--- Extracting from {pdf_path} ---")
    try:
        reader = PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                print(f"--- Page {i+1} ---")
                print(text)
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            extract_text(arg)
    else:
        print("Please provide PDF paths as arguments.")
