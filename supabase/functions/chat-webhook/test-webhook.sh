#!/bin/bash

# Test Chat Webhook - Simple Text Message
# This script tests the chat webhook with a simple text message

# Configuration
SUPABASE_URL="YOUR_SUPABASE_URL"  # Replace with your Supabase URL
WORKSPACE_ID="YOUR_WORKSPACE_ID"   # Replace with your workspace ID

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Chat Webhook - Simple Text Message${NC}"
echo "================================================"
echo ""

# Test 1: Simple text message with phone
echo -e "${YELLOW}Test 1: Simple text message from contact with phone${NC}"
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "John",
      "last_name": "Doe"
    },
    "message": {
      "content": "Hello! This is a test message from the webhook."
    }
  }')

echo "Response: $RESPONSE"
echo ""

# Test 2: Message with email instead of phone
echo -e "${YELLOW}Test 2: Text message from contact with email${NC}"
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "email": "jane.smith@example.com",
      "first_name": "Jane",
      "last_name": "Smith"
    },
    "message": {
      "content": "Hi! Testing with email instead of phone."
    }
  }')

echo "Response: $RESPONSE"
echo ""

# Test 3: Message with only name (fallback)
echo -e "${YELLOW}Test 3: Message with only contact name${NC}"
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+9876543210",
      "name": "Bob Wilson"
    },
    "message": {
      "content": "Testing with only name field."
    }
  }')

echo "Response: $RESPONSE"
echo ""

# Test 4: Message with timestamp
echo -e "${YELLOW}Test 4: Message with custom timestamp${NC}"
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"contact\": {
      \"phone\": \"+1234567890\",
      \"first_name\": \"John\",
      \"last_name\": \"Doe\"
    },
    \"message\": {
      \"content\": \"Message with custom timestamp.\",
      \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
    }
  }")

echo "Response: $RESPONSE"
echo ""

# Test 5: Invalid - Missing content
echo -e "${YELLOW}Test 5: Invalid request - Missing message content${NC}"
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890"
    },
    "message": {}
  }')

echo "Response: $RESPONSE"
echo ""

# Test 6: Invalid - Missing workspace
echo -e "${YELLOW}Test 6: Invalid request - Missing workspace ID${NC}"
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890"
    },
    "message": {
      "content": "Test message"
    }
  }')

echo "Response: $RESPONSE"
echo ""

echo -e "${GREEN}Testing complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check your CRM chat interface - messages should appear"
echo "2. Verify contacts were created/found correctly"
echo "3. Check Supabase function logs for any errors"
