#!/bin/bash

# Test script for Aeduca API endpoints
# Uses the provided JWT token for authentication

# Configuration
BASE_URL="http://localhost:3000/api/v1"
# NOTE: Update this token with a valid JWT token for your user
TOKEN="your_jwt_token_here"
TEST_DNI="70123456"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_test() {
    echo -e "\n${YELLOW}Testing:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Health check
print_test "Health Check"
curl -s -X GET "${BASE_URL}/health" | jq '.' || print_error "Health check failed"

# Test File Operations
print_test "File Operations"

# 1. Create directory
echo "Creating directory..."
DIR_RESPONSE=$(curl -s -X POST "${BASE_URL}/file/directory" \
  -H "authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"dni\": \"${TEST_DNI}\",
    \"name\": \"test_directory\",
    \"parent_path\": null,
    \"type\": \"dir\"
  }")
echo "$DIR_RESPONSE" | jq '.' || print_error "Create directory failed"

# 2. List user files
echo "Listing user files..."
curl -s -X GET "${BASE_URL}/file/user/${TEST_DNI}/null/false" \
  -H "authorization: ${TOKEN}" | jq '.' || print_error "List files failed"

# 3. Get storage usage
echo "Getting storage usage..."
curl -s -X GET "${BASE_URL}/file/usage/${TEST_DNI}" \
  -H "authorization: ${TOKEN}" | jq '.' || print_error "Get usage failed"

# Test Post Operations
print_test "Post Operations"

# 1. Create a post
echo "Creating post..."
POST_RESPONSE=$(curl -s -X POST "${BASE_URL}/post" \
  -H "authorization: ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post from refactored API",
    "commentable": true,
    "share_with": ["all"],
    "approved": true
  }')
echo "$POST_RESPONSE" | jq '.' || print_error "Create post failed"

# Extract post CODE if created successfully
POST_CODE=$(echo "$POST_RESPONSE" | jq -r '.data.code' 2>/dev/null)

if [ "$POST_CODE" != "null" ] && [ -n "$POST_CODE" ]; then
    print_success "Post created with CODE: $POST_CODE"
    
    # 2. Get post by CODE
    echo "Getting post by CODE..."
    curl -s -X GET "${BASE_URL}/post/${POST_CODE}" \
      -H "authorization: ${TOKEN}" | jq '.' || print_error "Get post failed"
    
    # 3. Like the post
    echo "Liking post..."
    curl -s -X POST "${BASE_URL}/post/${POST_CODE}/like" \
      -H "authorization: ${TOKEN}" | jq '.' || print_error "Like post failed"
    
    # 4. Save the post
    echo "Saving post..."
    curl -s -X POST "${BASE_URL}/post/${POST_CODE}/save" \
      -H "authorization: ${TOKEN}" | jq '.' || print_error "Save post failed"
    
    # Test Comment Operations
    print_test "Comment Operations"
    
    # 1. Create a comment
    echo "Creating comment..."
    COMMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/comment" \
      -H "authorization: ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{
        \"post_code\": ${POST_CODE},
        \"message\": \"Test comment on refactored post\",
        \"content_type\": \"text\"
      }")
    echo "$COMMENT_RESPONSE" | jq '.' || print_error "Create comment failed"
    
    # Extract comment CODE if created successfully
    COMMENT_CODE=$(echo "$COMMENT_RESPONSE" | jq -r '.data.code' 2>/dev/null)
    
    if [ "$COMMENT_CODE" != "null" ] && [ -n "$COMMENT_CODE" ]; then
        print_success "Comment created with CODE: $COMMENT_CODE"
        
        # 2. Reply to comment
        echo "Replying to comment..."
        curl -s -X POST "${BASE_URL}/comment/${COMMENT_ID}/reply" \
          -H "authorization: ${TOKEN}" \
          -H "Content-Type: application/json" \
          -d '{
            "message": "Test reply to comment",
            "content_type": "text"
          }' | jq '.' || print_error "Reply to comment failed"
        
        # 3. Get post comments
        echo "Getting post comments..."
        curl -s -X GET "${BASE_URL}/comment/post/${POST_ID}" \
          -H "authorization: ${TOKEN}" | jq '.' || print_error "Get comments failed"
    fi
    
    # 5. Get post stats
    echo "Getting post stats..."
    curl -s -X GET "${BASE_URL}/post/${POST_ID}/stats" \
      -H "authorization: ${TOKEN}" | jq '.' || print_error "Get stats failed"
fi

# Test Feed
print_test "Feed Operations"

echo "Getting user feed..."
curl -s -X GET "${BASE_URL}/post/feed" \
  -H "authorization: ${TOKEN}" | jq '.' || print_error "Get feed failed"

echo "Searching posts..."
curl -s -X GET "${BASE_URL}/post/search?q=test" \
  -H "authorization: ${TOKEN}" | jq '.' || print_error "Search posts failed"

# Test File Search
print_test "File Search"

echo "Searching files..."
curl -s -X GET "${BASE_URL}/file/search/70123456/test" \
  -H "authorization: ${TOKEN}" | jq '.' || print_error "Search files failed"

# Summary
echo ""
echo "========================================"
echo "Test execution completed!"
echo "Check the responses above for any errors"
echo "========================================"
