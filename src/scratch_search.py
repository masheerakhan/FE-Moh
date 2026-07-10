import os

for root, dirs, files in os.walk(r"c:\MOH_Clinics"):
    for file in files:
        if file.lower().endswith(".pdf"):
            print(f"Found PDF: {os.path.join(root, file)}")
