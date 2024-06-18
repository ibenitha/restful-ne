import React, { useContext, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import { UserContext } from '../context/UserContext';

export default function Login() {
  // Error state
  const [error, setError] = useState(null);

  // update user in the context
  const {user, setuser} = useContext(UserContext);

  // Handle the user input
  const navigate = useNavigate()
  const [formData, setFormData] = useState({})
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if the user exists
      const response = await axios.post(`http://localhost:3000/login`, formData);
      const returnedUser = response.data.data[0];

      const user = {
        token: response.data.token,
        ...returnedUser
      }

      setuser(user);
      navigate('/dashboard')
    } catch (error) {
      setError(error);
      console.log(error)
    }
  }

  return (
    <section className='flex flex-col lg:flex-row justify-center items-center w-[100vw] h-[100vh]'>
      <div className='flex flex-col justify-center items-center w-full lg:w-1/2 p-8'>
      <p  className='text-2xl font-bold text-blue-700 mb-4'> Book Management System </p>
      <h1 className='text-2xl font-bold mb-4'>Sign in </h1>
        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-md gap-4'>
          
          <input type="email" placeholder="Enter your email" name="email" onChange={handleChange} className='py-4 px-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-800 placeholder:text-lg'/>
          <input type="password" placeholder="Enter your password" name="password" onChange={handleChange} className='py-4 px-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-800 placeholder:text-lg'/>
          
          <button type="submit" className='w-full bg-blue-700 text-white py-4 rounded-md hover:opacity-75 font-bold text-xl'>Continue</button>
        </form>
        
        <p className='mt-4'>Don't have account? <Link to="/register" className='text-blue-900'>Sign up</Link></p>
        { error && <Alert msg={error.response.data.error} /> }
      </div>
    </section>
  )
}
