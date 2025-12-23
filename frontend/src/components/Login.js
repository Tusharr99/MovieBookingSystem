import React, { useState } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import axios from 'axios';

   const Login = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState(null);
     const navigate = useNavigate();

     const handleSubmit = async () => {
       setError(null);
       try {
         const { data } = await axios.post('http://localhost:5000/api/auth/login', {
           email,
           password,
         });
         console.log('Login response:', data);
         localStorage.setItem('token', data.token);
         navigate('/');
       } catch (error) {
         console.error('Login error:', error.response?.data || error.message);
         setError(error.response?.data?.error || 'Failed to login. Please try again.');
       }
     };

     return (
       <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
         <h2 className="text-2xl font-bold mb-6">Login</h2>
         {error && <p className="text-red-500 mb-4">{error}</p>}
         <input
           type="email"
           placeholder="Email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           className="w-full p-2 mb-4 border rounded"
         />
         <input
           type="password"
           placeholder="Password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           className="w-full p-2 mb-4 border rounded"
         />
         <button
           onClick={handleSubmit}
           className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
           disabled={!email || !password}
         >
           Login
         </button>
         <p className="mt-4 text-center">
           Don't have an account?{' '}
           <Link to="/register" className="text-blue-500 hover:underline">
             Register
           </Link>
         </p>
       </div>
     );
   };

   export default Login;