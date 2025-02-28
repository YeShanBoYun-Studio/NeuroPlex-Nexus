from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="neuracollab",
    version="1.0.0",
    author="NeuraCollab Team",
    description="A chain-based AI collaboration system with dynamic prompt workflows",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/username/neuracollab",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.7",
    install_requires=[
        "pydantic>=2.0.0",
        "nltk>=3.6.0",
        "aiohttp>=3.8.0",  # For async HTTP requests
        "python-dotenv>=0.19.0",  # For environment variable management
    ],
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-asyncio>=0.14.0",
            "black>=21.0",
            "isort>=5.0",
            "mypy>=0.900",
        ],
        "openai": ["openai>=1.0.0"],
        "anthropic": ["anthropic>=0.3.0"],
    }
)
