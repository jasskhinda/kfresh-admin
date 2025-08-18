#!/bin/bash

# Batch update script for remaining products
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4"
SUPABASE_URL="https://tmufbgaxhtqgkvcngyxg.supabase.co"

echo "🚀 Starting batch image updates..."

# Array of products to update (ID and image URL pairs)
declare -a products=(
    "7cb56a14-6bef-4977-892e-5256147afb1f:https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center"
    "d547eeff-0b32-468d-aa87-c2b0ec9f4ff8:https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center"
    "7cbf37bd-9eb7-4c28-93bf-76ad3bee0b81:https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center"
    "378b7283-d749-489e-984c-93625a5f6cbe:https://images.unsplash.com/photo-1599735894046-a50c98c8ceeb?w=400&h=400&fit=crop&crop=center"
    "c3c3750c-c36c-4380-8e0d-97b3ad3b310d:https://images.unsplash.com/photo-1598662906851-85b659e8b22c?w=400&h=400&fit=crop&crop=center"
    "db1a3501-3262-4fd9-8a0f-1686ebbcc700:https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&h=400&fit=crop&crop=center"
    "5d6942fe-d2d1-4106-b2aa-dcc31715279b:https://images.unsplash.com/photo-1598662906851-85b659e8b22c?w=400&h=400&fit=crop&crop=center"
    "8a1a8065-c8a8-4b9a-a7f0-96c41ab61486:https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center"
)

success_count=0
error_count=0

for product in "${products[@]}"; do
    IFS=":" read -r product_id image_url <<< "$product"
    
    echo "🔄 Updating product ID: $product_id"
    
    if curl -X PATCH \
        -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
        -H "apikey: $SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=minimal" \
        -d "{\"images\":[\"$image_url\"]}" \
        "$SUPABASE_URL/rest/v1/products?id=eq.$product_id" \
        --silent --fail; then
        echo "✅ Successfully updated product $product_id"
        ((success_count++))
    else
        echo "❌ Failed to update product $product_id"
        ((error_count++))
    fi
    
    # Small delay to avoid overwhelming the API
    sleep 0.1
done

echo ""
echo "🎉 Batch update complete!"
echo "✅ Successfully updated: $success_count"
echo "❌ Failed: $error_count"
echo "📊 Total processed: $((success_count + error_count))"
