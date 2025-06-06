cd frontend
npm run build

cd ..

rm -rf backend/frontend-build
mkdir -p backend/frontend-build
cp -R frontend/build/* backend/frontend-build/

cd backend
node server.js