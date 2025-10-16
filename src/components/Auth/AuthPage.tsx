import { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';
import { Home } from 'lucide-react';

export const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Househub</span>
        </div>
      </div>

      {isSignIn ? (
        <SignIn onToggleMode={() => setIsSignIn(false)} />
      ) : (
        <SignUp onToggleMode={() => setIsSignIn(true)} />
      )}
    </div>
  );
};
