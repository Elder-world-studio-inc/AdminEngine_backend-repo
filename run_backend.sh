#!/bin/bash
echo "=========================================="
echo "  Admin Engine Backend - Auto Start"
echo "=========================================="

cd backend-core

echo "[1/3] Testing Database Connection..."
node db/test_connect.js
if [ $? -ne 0 ]; then
   echo ""
   echo "[ERROR] Connection test failed. Please check your internet or credentials."
   read -p "Press Enter to exit..."
   exit 1
fi

echo ""
echo "[2/3] Setting up Database (Migrations & Seeds)..."
npm run db:setup
if [ $? -ne 0 ]; then
   echo ""
   echo "[ERROR] Database setup failed."
   read -p "Press Enter to exit..."
   exit 1
fi

echo ""
echo "[3/3] Starting Server..."
npm start
