import { useState, useContext, useEffect } from "react";
import {  useNavigate, Link } from "react-router-dom";
import FirebaseContext from '../context/firebase';
import doesUsernameExist from "../services/firebase";
import * as ROUTES from '../constants/routes'

export default function SignUp () {
    const navigate = useNavigate();
    const { firebase } = useContext(FirebaseContext);
    
    const [userName, setUserName ] = useState('');
    const [fullName, setFullName ] = useState('');
    const [emailAddress, setEmailAddress ] = useState('');
    const [password, setPassword ] = useState('');

 
    const [error, setError ] = useState('');
    const isInvalid = password === '' || emailAddress === '';

    const handleSignUp = async (event) => {
      event.preventDefault();

      const usernameExists = await doesUsernameExist(userName)

      if (!usernameExists) {
        try {
          const createdUserResult = await firebase
            .auth()
            .createUserWithEmailAndPassword(emailAddress, password)

          await createdUserResult.user.updateProfile({
            displayName: userName
          });

          await firebase.firestore().collection('users').add({
            userId: createdUserResult.user.uid,
            username: userName.toLowerCase(),
            fullName,
            emailAddress: emailAddress.toLowerCase(),
            following: [],
            dateCreated: Date.now()
          });

          navigate(ROUTES.DASHBOARD)
        } catch (error) {
          let errorMessage = error.message.replace('Firebase:','');
          setError(`Hey ${fullName}! Sorry but ${errorMessage.toLowerCase()}`);
        }
      } else {
          setError(`Hey ${fullName}! Sorry but that username is already taken, please try another one.`)
      }
    };

    useEffect(() => {
        document.title = 'Sign Up - Instagram'
    }, []);

    return (
        <div className="container flex mx-auto max-w-screen-md items-center h-screen">
            <div className="flex w-3/5">
                <img src="/images/iphone-with-profile.jpg" alt="phone" />
            </div>
            <div className="flex flex-col w-2/5">
                <div className="flex flex-col items-center bg-white p-4 border border-grey-primary mb-4 rounded">
                <h1 className="flex justify-center w-full">
                    <img src="/images/logo.png" alt="logo" className="mt-2 w-6/12 mb-4" />
                </h1>

                {error && <p className="mb-4 text-xs text-red-primary">{error}</p>}

                <form onSubmit={handleSignUp} method="POST">
                    <input
                      aria-label="Enter your username"
                      type="text"
                      placeholder="Username"
                      className="text-sm text-gray-base w-full mr-2 py-5 px-4 h-2 border border-grey-primary rounded mb-2"
                      onChange={({target}) => setUserName(target.value)}
                      value={userName}
                    />
                    <input
                      aria-label="Enter your full name"
                      type="text"
                      placeholder="Full Name"
                      className="text-sm text-gray-base w-full mr-2 py-5 px-4 h-2 border border-grey-primary rounded mb-2"
                      onChange={({target}) => setFullName(target.value)}
                      value={fullName}
                    />
                    <input
                      aria-label="Enter your email address"
                      type="text"
                      placeholder="Email address"
                      className="text-sm text-gray-base w-full mr-2 py-5 px-4 h-2 border border-grey-primary rounded mb-2"
                      onChange={({target}) => setEmailAddress(target.value)}
                      value={emailAddress}
                    />
                    <input
                      aria-label="Enter your password"
                      type="password"
                      placeholder="Password"
                      className="text-sm text-gray-base w-full mr-2 py-5 px-4 h-2 border border-grey-primary rounded mb-2"
                      onChange={({target}) => setPassword(target.value)}
                      value={password}
                    />
                    <button 
                      disabled={isInvalid} 
                      type="submit" 
                      className={`bg-blue-medium text-white w-full rounded h-8 font-bold
                      ${isInvalid && 'opacity-50'}`}
                    >
                       Log In
                    </button>
                </form>
            </div>
            <div className="flex justify-center items-center flex-col w-full rounded bg-white p-4 border border-grey-primary">
                <p className="text-sm">Have an account?{' '}
                  <Link to={ROUTES.LOGIN} className="font-bold text-blue-medium">
                    Login
                  </Link>
                </p>
            </div>
          </div>
        </div>
    )
}