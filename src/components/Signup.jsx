import { useState } from 'react';
import Login from './Login';
import { useAuth } from './AuthProvider';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [existingUser, setExistingUser] = useState(false);
  const [alert, setAlert] = useState('');
  const { login } = useAuth();

  const checkExistingUser = async () => {
    const response = await fetch('http://localhost:3001/api/auth/check-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.exists;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userExists = await checkExistingUser();

    if (userExists) {
      setAlert('User already exists with this email.');
      setEmail('');
      setPassword('');
      setName('');
    } else {
      setAlert('');
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.message === 'User created successfully') {
          localStorage.setItem('authToken', data.token);
          login(data.user);
          setEmail('');
          setPassword('');
          setName('');
        }
      } else {
        const errorData = await response.json();
        setAlert(errorData.message || 'Signup failed. Please try again.');
      }
    }
  };

  if (existingUser) {
    return <Login setExistingUser={setExistingUser} />;
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4'>
      <div className='max-w-md w-full space-y-8'>
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center mb-4'>
              <svg className='h-6 w-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Join Book Club</h2>
            <p className='text-gray-600'>Create your account to start reading</p>
          </div>

          {/* Alert Message */}
          {alert && (
            <div className='mb-6 p-4 rounded-lg bg-red-50 border border-red-200'>
              <p className='text-red-700 text-sm'>{alert}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400'
                placeholder='Enter your full name'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400'
                placeholder='Create a password'
              />
            </div>

            <button
              type="submit"
              className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02]'
            >
              Create Account
            </button>
          </form>

          {/* Footer */}
          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setExistingUser(true)}
                className='text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200'
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
