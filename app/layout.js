import { AuthProvider } from './lib/AuthContext';
import './globals.css';

export const metadata = {
  title: 'CampaignAI',
  description: 'AI-powered marketing campaign generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}