#!/bin/bash

echo "Setting up LeadHunter..."
echo

echo "Installing dependencies..."
npm install

echo
echo "Initializing database..."
npm run db:migrate

echo
echo "Setup complete!"
echo
echo "To start the application:"
echo "  npm run dev"
echo
echo "Default admin login:"
echo "  Email: admin@leadshunter.com"
echo "  Password: password"
echo
echo "Don't forget to:"
echo "1. Update your .env.local file with your Apollo.io API key"
echo "2. Change the default admin password after first login"
echo