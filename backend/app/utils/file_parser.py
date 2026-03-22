def read_file(file_path):

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
    
def extract_text(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    return text