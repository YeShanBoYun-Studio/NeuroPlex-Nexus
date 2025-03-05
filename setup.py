from setuptools import setup, find_packages

setup(
    name="neuracollab",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Core dependencies
        "fastapi>=0.100.0",
        "uvicorn[standard]>=0.20.0",
        "pydantic>=2.0.0",
        "python-dotenv>=1.0.0",
        "websockets>=11.0.0",
        "pyyaml>=6.0.0",
        "aiosqlite>=0.19.0",
        "sqlalchemy>=2.0.0",
        "openai>=1.0.0",
        "httpx>=0.24.0",
        "numpy>=1.24.0",
        "nltk>=3.8.0",
        "requests>=2.31.0",
    ],
    entry_points={
        "console_scripts": [
            "neuracollab=neuracollab.server:main",
        ],
    },
    python_requires=">=3.9",
    author="NeuraCollab Team",
    author_email="team@neuracollab.ai",
    description="AI Collaboration Platform with Global Cache Pool",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/neuracollab/neuracollab",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
