# Firebase Firestore Indexes Setup

## Required Composite Indexes for Message Service

The application requires the following composite indexes to be created in Firebase Console:

### 1. Messages Collection - Direct Messages Query
**Collection**: `messages`
**Fields to index**:
- `to` (Ascending)
- `status` (Ascending) 
- `timestamp` (Descending)

**Firebase Console URL**: 
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
```

### 2. Messages Collection - Department Messages Query
**Collection**: `messages`
**Fields to index**:
- `recipientDepartments` (Arrays)
- `status` (Ascending)
- `timestamp` (Descending)

### 3. Messages Collection - Sent Messages Query
**Collection**: `messages`
**Fields to index**:
- `senderId` (Ascending)
- `status` (Ascending)
- `timestamp` (Descending)

## How to Create Indexes

### Method 1: Using Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Add the fields as specified above

### Method 2: Using Firebase CLI
Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "to",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "recipientDepartments",
          "arrayConfig": "CONTAINS"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "senderId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy using:
```bash
firebase deploy --only firestore:indexes
```

## Current Workaround

The application currently uses fallback queries that:
1. Query with only required WHERE clauses (no ORDER BY)
2. Sort results in memory using JavaScript
3. Still provide real-time updates via Firestore listeners

This approach works but may be slower for large datasets. Creating the proper indexes will improve performance significantly.

## Index Creation Time

- Small collections (< 100 documents): ~1-2 minutes
- Medium collections (100-10,000 documents): ~5-15 minutes  
- Large collections (> 10,000 documents): ~30+ minutes

You can monitor index creation progress in the Firebase Console.
