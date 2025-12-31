#!/usr/bin/env python3
"""
PDF Converter for Little Drop eBook
Converts Markdown to professional PDF using WeasyPrint
"""

import markdown2
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
import sys

def convert_markdown_to_pdf(input_md, output_pdf):
    """Convert markdown file to PDF"""
    
    # Read markdown file
    with open(input_md, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown2.markdown(
        md_content,
        extras=[
            'fenced-code-blocks',
            'tables',
            'toc',
            'header-ids',
            'metadata',
            'strike',
            'task_list'
        ]
    )
    
    # CSS styling for professional book layout
    css_string = """
    @page {
        size: A4;
        margin: 2.5cm 2cm 2.5cm 2cm;
        
        @top-right {
            content: "Little Drop 💧 Mighty Ocean";
            font-size: 9pt;
            font-style: italic;
            color: #666;
        }
        
        @bottom-center {
            content: counter(page);
            font-size: 9pt;
        }
    }
    
    body {
        font-family: Georgia, serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
        text-align: justify;
    }
    
    h1 {
        font-size: 26pt;
        font-weight: bold;
        color: #1a365d;
        margin-top: 2cm;
        margin-bottom: 1cm;
        page-break-before: always;
        text-align: center;
    }
    
    h2 {
        font-size: 20pt;
        font-weight: bold;
        color: #2c5364;
        margin-top: 1.5cm;
        margin-bottom: 0.5cm;
        border-bottom: 2px solid #4fd1c5;
        padding-bottom: 0.2cm;
    }
    
    h3 {
        font-size: 14pt;
        font-weight: bold;
        color: #2c5364;
        margin-top: 1cm;
        margin-bottom: 0.3cm;
    }
    
    p {
        margin-bottom: 0.5cm;
        text-indent: 0.5cm;
    }
    
    blockquote {
        font-style: italic;
        background-color: #f0f8ff;
        border-left: 4px solid #4fd1c5;
        padding: 0.5cm;
        margin: 1cm 0;
    }
    
    strong {
        color: #1a365d;
        font-weight: bold;
    }
    
    em {
        color: #555;
    }
    
    ul, ol {
        margin-left: 1cm;
        margin-bottom: 0.5cm;
    }
    
    li {
        margin-bottom: 0.2cm;
    }
    
    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1cm 0;
        font-size: 10pt;
    }
    
    th {
        background-color: #1a365d;
        color: white;
        padding: 0.3cm;
        text-align: left;
        border: 1px solid #ccc;
    }
    
    td {
        padding: 0.3cm;
        border: 1px solid #ccc;
    }
    
    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    code {
        font-family: 'Courier New', monospace;
        background-color: #f4f4f4;
        padding: 0.1cm 0.2cm;
        border-radius: 3px;
        font-size: 9pt;
    }
    
    pre {
        background-color: #f4f4f4;
        padding: 0.5cm;
        border-radius: 5px;
        overflow-x: auto;
        margin: 0.5cm 0;
    }
    
    hr {
        border: none;
        border-top: 2px solid #4fd1c5;
        margin: 1cm 0;
    }
    
    .page-break {
        page-break-after: always;
    }
    
    /* First page title styling */
    body > h1:first-of-type {
        font-size: 32pt;
        color: #1a365d;
        margin-top: 5cm;
        text-align: center;
        page-break-before: avoid;
    }
    """
    
    # Wrap HTML with proper structure
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Little Drop 💧 Mighty Ocean</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Font configuration
    font_config = FontConfiguration()
    
    # Create PDF
    print(f"Converting {input_md} to {output_pdf}...")
    html = HTML(string=full_html)
    css = CSS(string=css_string, font_config=font_config)
    
    html.write_pdf(
        output_pdf,
        stylesheets=[css],
        font_config=font_config
    )
    
    print(f"✅ PDF created successfully: {output_pdf}")
    return output_pdf

if __name__ == "__main__":
    input_file = "LITTLE_DROP_EBOOK.md"
    output_file = "LITTLE_DROP_EBOOK.pdf"
    
    try:
        convert_markdown_to_pdf(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
