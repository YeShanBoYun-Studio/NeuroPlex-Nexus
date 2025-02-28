import nltk

def setup_nltk():
    """
    Download required NLTK data during package installation
    """
    try:
        nltk.download('punkt', quiet=True)
    except Exception as e:
        print(f"Warning: Could not download NLTK data: {e}")

if __name__ == "__main__":
    setup_nltk()
