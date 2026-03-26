import { AuthProvider } from './lib/AuthContext';
import './globals.css';

export const metadata = {
  title: 'AIGCStudio by eFusion',
  description: 'AI-powered marketing campaign storyboard generator by eFusion Technology',
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