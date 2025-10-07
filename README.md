 # 🔐 SecureVault Password Manager

A modern, secure password manager with zero-knowledge client-side encryption.

## Features

- ✅ Client-side AES-GCM 256-bit encryption
- ✅ Zero-knowledge architecture
- ✅ Secure password generator
- ✅ JWT authentication
- ✅ Search & filter vault
- ✅ Copy with auto-clear (15s)
- ✅ TypeScript throughout

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Encryption**: Web Crypto API

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas

### Installation

1. **Clone repository**
\`\`\`bash
git clone <your-repo-url>
cd password-manager
\`\`\`

2. **Run setup script**
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

3. **Start backend** (Terminal 1)
\`\`\`bash
cd backend
npm run dev
\`\`\`

4. **Start frontend** (Terminal 2)
\`\`\`bash
cd frontend
npm run dev
\`\`\`

5. **Visit** http://localhost:3000

## Environment Variables

### Backend (.env)
\`\`\`env Example
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/password-manager
JWT_SECRET=jhbkfvyjno9m
FRONTEND_URL=http://localhost:3000
\`\`\`

### Frontend (.env.local)
\`\`\`env Example
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

## Encryption

Uses **Web Crypto API** for client-side encryption:

- **Algorithm**: AES-GCM 256-bit
- **Key Derivation**: PBKDF2 (100,000 iterations)
- **Hash**: SHA-256

Server only stores encrypted blobs - never plaintext passwords!

## Deployment

### Free Hosting

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

See IMPLEMENTATION_GUIDE.md for detailed deployment steps.

## License

MIT

## Security

For security concerns, please open an issue or contact the maintainers.
\`\`\`

---

## 🎉 Complete! All Files Provided

You now have every single file with complete code and exact file paths. Simply:

1. Create the directory structure
2. Copy each file to its location
3. Run `chmod +x setup.sh && ./setup.sh`
4. Start both servers
5. Open http://localhost:3000

**Total Files**: 37 files across backend and frontend!# 🔐 SecureVault - Complete File Listing with Code

## 📁 Project Structure