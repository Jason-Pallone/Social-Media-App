import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FirebaseContext from '../context/firebase';

export default function Login () {
    const history = useNavigate();
    const { firebase } = useContext(FirebaseContext);

    const [emailAddress, setEmailAddress ] = useState('');
    const [password, setPassword ] = useState('');
 
    const [error, setError ] = useState('');
    const isInvalid = password === '' || emailAddress === '';

    const handleLogin = () => {};

    useEffect(() => {
        document.title = 'Login - Instagram'
    }, []);

    return (
        <p>Login Page</p>
    )
}