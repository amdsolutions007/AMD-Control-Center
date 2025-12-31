#!/usr/bin/env python3
"""
Simple Markdown to PDF Converter using markdown2 and reportlab
"""

from markdown2 import markdown
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
import re

def convert_markdown_to_pdf(input_md, output_pdf):
    """Convert markdown to PDF using reportlab"""
    
    # Read markdown file
    with open(input_md, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2.5*cm,
        bottomMargin=2.5*cm
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#1a365d'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#2c5364'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2c5364'),
        spaceAfter=10,
        spaceBefore=15,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        leading=16,
        alignment=TA_JUSTIFY,
        spaceAfter=10,
        fontName='Times-Roman'
    )
    
    # Split content by lines
    lines = md_content.split('\n')
    
    is_first_h1 = True
    
    for line in lines:
        line = line.strip()
        
        if not line:
            elements.append(Spacer(1, 0.3*cm))
            continue
        
        # Handle H1 (# )
        if line.startswith('# '):
            text = line[2:].strip()
            if is_first_h1:
                elements.append(PageBreak())
                elements.append(Spacer(1, 3*cm))
                elements.append(Paragraph(text, title_style))
                elements.append(Spacer(1, 1*cm))
                is_first_h1 = False
            else:
                elements.append(PageBreak())
                elements.append(Paragraph(text, heading1_style))
                elements.append(Spacer(1, 0.5*cm))
        
        # Handle H2 (## )
        elif line.startswith('## '):
            text = line[3:].strip()
            elements.append(Paragraph(text, heading2_style))
        
        # Handle H3 (### )
        elif line.startswith('### '):
            text = line[4:].strip()
            elements.append(Paragraph(text, heading2_style))
        
        # Handle horizontal rule
        elif line.startswith('---'):
            elements.append(Spacer(1, 0.5*cm))
        
        # Handle blockquote
        elif line.startswith('>'):
            text = line[1:].strip()
            quote_style = ParagraphStyle(
                'Quote',
                parent=body_style,
                italic=True,
                leftIndent=1*cm,
                textColor=colors.HexColor('#555555')
            )
            elements.append(Paragraph(text, quote_style))
        
        # Handle bullet points
        elif line.startswith('- ') or line.startswith('* '):
            text = line[2:].strip()
            bullet_style = ParagraphStyle(
                'Bullet',
                parent=body_style,
                leftIndent=1*cm,
                bulletIndent=0.5*cm
            )
            elements.append(Paragraph('• ' + text, bullet_style))
        
        # Handle numbered lists
        elif re.match(r'^\d+\.\s', line):
            text = re.sub(r'^\d+\.\s', '', line)
            elements.append(Paragraph(text, body_style))
        
        # Regular paragraph
        else:
            # Convert markdown formatting
            text = line
            # Bold (handle multiple occurrences properly)
            while '**' in text:
                text = text.replace('**', '<b>', 1).replace('**', '</b>', 1)
            # Italic (handle multiple occurrences properly)
            count = 0
            new_text = ""
            i = 0
            while i < len(text):
                if text[i] == '*' and (i == 0 or text[i-1] != '*') and (i == len(text)-1 or text[i+1] != '*'):
                    if count % 2 == 0:
                        new_text += '<i>'
                    else:
                        new_text += '</i>'
                    count += 1
                    i += 1
                else:
                    new_text += text[i]
                    i += 1
            text = new_text
            # Inline code
            text = re.sub(r'`([^`]+)`', r'<font name="Courier">\1</font>', text)
            
            try:
                elements.append(Paragraph(text, body_style))
            except:
                # Fallback for problematic formatting
                clean_text = text.replace('<b>', '').replace('</b>', '').replace('<i>', '').replace('</i>', '')
                elements.append(Paragraph(clean_text, body_style))
    
    # Build PDF
    print(f"Converting {input_md} to {output_pdf}...")
    doc.build(elements)
    print(f"✅ PDF created successfully: {output_pdf}")
    return output_pdf

if __name__ == "__main__":
    input_file = "LITTLE_DROP_EBOOK.md"
    output_file = "LITTLE_DROP_EBOOK.pdf"
    
    try:
        convert_markdown_to_pdf(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
