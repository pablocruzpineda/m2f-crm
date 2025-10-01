#!/bin/bash

# Test Chat Webhook - Advanced Tests
# Tests different message types and media

# Configuration
SUPABASE_URL="YOUR_SUPABASE_URL"  # Replace with your Supabase URL
WORKSPACE_ID="YOUR_WORKSPACE_ID"   # Replace with your workspace ID

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}Testing Chat Webhook - Advanced Tests${NC}"
echo "======================================================"
echo ""

# Test 1: Image message
echo -e "${YELLOW}Test 1: Image message${NC}"
curl -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "John",
      "last_name": "Doe"
    },
    "message": {
      "content": "Check out this image!",
      "message_type": "image",
      "media_url": "https://example.com/images/sample.jpg"
    }
  }' | jq '.'
echo ""

# Test 2: File message
echo -e "${YELLOW}Test 2: File message${NC}"
curl -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "John",
      "last_name": "Doe"
    },
    "message": {
      "content": "Document attached",
      "message_type": "file",
      "media_url": "https://example.com/files/document.pdf"
    }
  }' | jq '.'
echo ""

# Test 3: Audio message
echo -e "${YELLOW}Test 3: Audio message${NC}"
curl -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1234567890",
      "first_name": "John",
      "last_name": "Doe"
    },
    "message": {
      "content": "Voice message",
      "message_type": "audio",
      "media_url": "https://example.com/audio/voice-note.mp3"
    }
  }' | jq '.'
echo ""

# Test 4: Multiple messages from same contact
echo -e "${YELLOW}Test 4: Multiple messages from same contact${NC}"
for i in {1..3}; do
  echo "Sending message $i..."
  curl -s -X POST \
    "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
    -H 'Content-Type: application/json' \
    -d "{
      \"contact\": {
        \"phone\": \"+1234567890\",
        \"first_name\": \"John\",
        \"last_name\": \"Doe\"
      },
      \"message\": {
        \"content\": \"Message number $i from conversation\"
      }
    }" | jq '.'
  sleep 1
done
echo ""

# Test 5: Messages from different contacts
echo -e "${YELLOW}Test 5: Messages from different contacts${NC}"

echo "Contact 1: Alice"
curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+1111111111",
      "first_name": "Alice",
      "last_name": "Johnson"
    },
    "message": {
      "content": "Hi! Message from Alice"
    }
  }' | jq '.'

echo "Contact 2: Bob"
curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "phone": "+2222222222",
      "first_name": "Bob",
      "last_name": "Smith"
    },
    "message": {
      "content": "Hello! Message from Bob"
    }
  }' | jq '.'

echo "Contact 3: Charlie"
curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contact": {
      "email": "charlie@example.com",
      "first_name": "Charlie",
      "last_name": "Brown"
    },
    "message": {
      "content": "Hey! Message from Charlie"
    }
  }' | jq '.'
echo ""

# Test 6: Long message
echo -e "${YELLOW}Test 6: Long message content${NC}"
LONG_MESSAGE="This is a very long message to test how the webhook handles larger text content. "
LONG_MESSAGE+="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt "
LONG_MESSAGE+="ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco "
LONG_MESSAGE+="laboris nisi ut aliquip ex ea commodo consequat. This should all be stored correctly in the database."

curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/chat-webhook?workspace=${WORKSPACE_ID}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"contact\": {
      \"phone\": \"+1234567890\",
      \"first_name\": \"John\",
      \"last_name\": \"Doe\"
    },
    \"message\": {
      \"content\": \"$LONG_MESSAGE\"
    }
  }" | jq '.'
echo ""

echo -e "${GREEN}Advanced testing complete!${NC}"
echo ""
echo "Verification steps:"
echo "1. Go to your CRM and check the chat interface"
echo "2. You should see messages from multiple contacts"
echo "3. Check message types (text, image, file, audio)"
echo "4. Verify contacts were auto-created if enabled"
echo "5. Check that unread indicators appear correctly"
