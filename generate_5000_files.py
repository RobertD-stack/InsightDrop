#!/usr/bin/env python3
"""
Script to generate 5000 different test files and create a zip archive
Optimized for testing the file classification system
"""
import os
import zipfile
import json
import csv
import random
import string
from pathlib import Path

def generate_random_string(length=100):
    """Generate a random string"""
    return ''.join(random.choices(string.ascii_letters + string.digits + ' \n\t', k=length))

def generate_txt_file(file_num):
    """Generate a text file with random content"""
    content = f"Text File #{file_num}\n"
    content += "=" * 50 + "\n"
    content += generate_random_string(random.randint(200, 1000))
    return content.encode('utf-8')

def generate_json_file(file_num):
    """Generate a JSON file with random structure"""
    data = {
        "file_id": file_num,
        "name": f"test_file_{file_num}",
        "type": random.choice(["document", "image", "video", "audio", "data"]),
        "size": random.randint(100, 10000),
        "metadata": {
            "created": f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
            "author": random.choice(["Alice", "Bob", "Charlie", "Diana", "Eve"]),
            "tags": random.sample(["important", "archive", "draft", "final", "backup"], k=random.randint(1, 3))
        },
        "values": [random.randint(1, 100) for _ in range(random.randint(5, 20))]
    }
    return json.dumps(data, indent=2).encode('utf-8')

def generate_csv_file(file_num):
    """Generate a CSV file with random data"""
    import io
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    headers = ["id", "name", "value", "category", "date"]
    writer.writerow(headers)
    
    # Data rows
    for i in range(random.randint(10, 50)):
        writer.writerow([
            i + 1,
            f"item_{i}",
            random.randint(1, 1000),
            random.choice(["A", "B", "C", "D"]),
            f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        ])
    
    return output.getvalue().encode('utf-8')

def generate_html_file(file_num):
    """Generate an HTML file"""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Test File {file_num}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #333; }}
    </style>
</head>
<body>
    <h1>Test HTML File #{file_num}</h1>
    <p>This is a test HTML file generated for file classification testing.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
    <p>{generate_random_string(200)}</p>
</body>
</html>"""
    return html.encode('utf-8')

def generate_py_file(file_num):
    """Generate a Python file"""
    code = f'''"""
Test Python file #{file_num}
Generated for file classification testing
"""

def function_{file_num}():
    """A test function"""
    x = {random.randint(1, 100)}
    y = {random.randint(1, 100)}
    return x + y

class TestClass{file_num}:
    """A test class"""
    def __init__(self):
        self.value = {random.randint(1, 1000)}
    
    def get_value(self):
        return self.value

if __name__ == "__main__":
    result = function_{file_num}()
    print(f"Result: {{result}}")
    obj = TestClass{file_num}()
    print(f"Object value: {{obj.get_value()}}")
'''
    return code.encode('utf-8')

def generate_xml_file(file_num):
    """Generate an XML file"""
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<root>
    <file id="{file_num}">
        <name>test_file_{file_num}</name>
        <type>{random.choice(["document", "data", "config"])}</type>
        <properties>
            <size>{random.randint(100, 10000)}</size>
            <created>2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}</created>
        </properties>
        <items>
            {''.join([f'<item id="{i}">Item {i}</item>' for i in range(random.randint(5, 15))])}
        </items>
    </file>
</root>'''
    return xml.encode('utf-8')

def generate_md_file(file_num):
    """Generate a Markdown file"""
    md = f'''# Test Markdown File #{file_num}

This is a test markdown file for classification testing.

## Section 1

{generate_random_string(300)}

## Section 2

- Item 1
- Item 2
- Item 3

## Code Example

```python
def example():
    return "Hello, World!"
```

## Conclusion

This file was generated automatically for testing purposes.
'''
    return md.encode('utf-8')

def generate_yaml_file(file_num):
    """Generate a YAML file"""
    yaml = f'''# Test YAML File #{file_num}
file:
  id: {file_num}
  name: test_file_{file_num}
  type: {random.choice(["config", "data", "document"])}
  properties:
    size: {random.randint(100, 10000)}
    created: 2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}
  items:
{chr(10).join([f"    - item_{i}" for i in range(random.randint(5, 15))])}
'''
    return yaml.encode('utf-8')

def generate_js_file(file_num):
    """Generate a JavaScript file"""
    js = f'''// Test JavaScript file #{file_num}
const fileId = {file_num};

function testFunction{file_num}() {{
    const x = {random.randint(1, 100)};
    const y = {random.randint(1, 100)};
    return x + y;
}}

const obj{file_num} = {{
    id: {file_num},
    name: "test_file_{file_num}",
    value: {random.randint(1, 1000)}
}};

console.log("File ID:", fileId);
console.log("Result:", testFunction{file_num}());
console.log("Object:", obj{file_num});
'''
    return js.encode('utf-8')

def generate_css_file(file_num):
    """Generate a CSS file"""
    css = f'''/* Test CSS File #{file_num} */
body {{
    font-family: Arial, sans-serif;
    margin: {random.randint(10, 50)}px;
    padding: {random.randint(10, 30)}px;
    background-color: #{random.randint(0x100000, 0xffffff):06x};
}}

h1 {{
    color: #{random.randint(0x100000, 0xffffff):06x};
    font-size: {random.randint(16, 32)}px;
}}

.container {{
    width: {random.randint(500, 1200)}px;
    margin: 0 auto;
}}
'''
    return css.encode('utf-8')

def generate_sql_file(file_num):
    """Generate a SQL file"""
    sql = f'''-- Test SQL File #{file_num}
-- Generated for file classification testing

CREATE TABLE test_table_{file_num} (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    value INT,
    created_at TIMESTAMP
);

INSERT INTO test_table_{file_num} (id, name, value, created_at) VALUES
{','.join([f"({i}, 'item_{i}', {random.randint(1, 1000)}, '2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}')" for i in range(1, random.randint(5, 15))])};

SELECT * FROM test_table_{file_num} WHERE value > 100;
'''
    return sql.encode('utf-8')

# File type generators mapping
FILE_GENERATORS = {
    'txt': generate_txt_file,
    'json': generate_json_file,
    'csv': generate_csv_file,
    'html': generate_html_file,
    'py': generate_py_file,
    'xml': generate_xml_file,
    'md': generate_md_file,
    'yaml': generate_yaml_file,
    'yml': generate_yaml_file,
    'js': generate_js_file,
    'css': generate_css_file,
    'sql': generate_sql_file,
}

# Distribution of file types (ensures variety)
FILE_TYPE_DISTRIBUTION = [
    'txt', 'txt', 'txt', 'txt', 'txt',  # 25% txt
    'json', 'json', 'json',  # 15% json
    'csv', 'csv',  # 10% csv
    'html', 'html',  # 10% html
    'py', 'py',  # 10% py
    'xml',  # 5% xml
    'md',  # 5% md
    'yaml',  # 5% yaml
    'js',  # 5% js
    'css',  # 5% css
    'sql',  # 5% sql
]

def main():
    print("🚀 Generating 5000 test files...")
    print("=" * 60)
    
    output_zip = "test_files_5000.zip"
    total_files = 5000
    
    # Remove existing zip if it exists
    if os.path.exists(output_zip):
        os.remove(output_zip)
        print(f"✅ Removed existing {output_zip}")
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for i in range(1, total_files + 1):
            # Select file type based on distribution
            file_type = random.choice(FILE_TYPE_DISTRIBUTION)
            
            # Generate filename
            filename = f"test_file_{i:05d}.{file_type}"
            
            # Generate file content
            generator = FILE_GENERATORS[file_type]
            content = generator(i)
            
            # Add to zip
            zipf.writestr(filename, content)
            
            # Progress indicator
            if i % 500 == 0:
                progress = (i / total_files) * 100
                print(f"  Progress: {i}/{total_files} files ({progress:.1f}%)")
    
    # Get file size
    file_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    
    print("=" * 60)
    print(f"✅ Successfully created {output_zip}")
    print(f"   Total files: {total_files}")
    print(f"   File size: {file_size_mb:.2f} MB")
    print(f"   Location: {os.path.abspath(output_zip)}")
    print("=" * 60)
    print("\n📦 Zip file is ready for download!")
    print("💡 This file is optimized for testing with the classification system")

if __name__ == "__main__":
    main()

