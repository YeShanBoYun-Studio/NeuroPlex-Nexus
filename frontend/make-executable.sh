#!/bin/bash

# Colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Make setup.sh executable
chmod +x setup.sh
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully made setup.sh executable${NC}"
else
    echo -e "${RED}Failed to make setup.sh executable${NC}"
    exit 1
fi

# Set proper permissions for other shell scripts if they exist
find . -type f -name "*.sh" -exec chmod +x {} \;
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully updated permissions for all shell scripts${NC}"
else
    echo -e "${RED}Failed to update permissions for some shell scripts${NC}"
    exit 1
fi

# Make Husky hooks executable if they exist
if [ -d ".husky" ]; then
    chmod +x .husky/*
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Successfully made Husky hooks executable${NC}"
    else
        echo -e "${RED}Failed to make Husky hooks executable${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}All scripts have been made executable successfully!${NC}"
exit 0
