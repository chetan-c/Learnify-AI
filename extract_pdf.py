import pypdf
import sys

try:
    pdf_path = "real_test.pdf"
    with open(pdf_path, "rb") as file:
        pdf_reader = pypdf.PdfReader(file)
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
        print(text)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
