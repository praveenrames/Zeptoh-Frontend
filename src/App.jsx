import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import './App.css'

const SALT = "SALT1234";
const KEY = CryptoJS.SHA256("internsNeverGuess");

function decryptField(data, iv) {
    try {
        const bytes = CryptoJS.AES.decrypt(data, KEY, {
            iv: CryptoJS.enc.Base64.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted.startsWith(SALT)) return null;
        decrypted = decrypted.replace(SALT, '');

        if (!/^.+:.+$/.test(decrypted)) return null;
        const [label, type] = decrypted.split(':');
        return { label, type };
    } catch (e) {
        return null;
    }
}

function App() {
    const [fields, setFields] = useState([]);
    const [index, setIndex] = useState(0);
    const [formData, setFormData] = useState([]);

    useEffect(() => {
        axios.get('https://zeptoh-backend-3.onrender.com/api/form').then(res => {
            const decryptedFields = res.data.map(f =>
                decryptField(f.data, f.iv)
            ).filter(f => f !== null);
            setFields(decryptedFields);
        });
    }, []);

    const handleChange = (label, value) => {
        setFormData({ ...formData, [label]: value });
    };

    const handleBlur = () => {
        if (index < fields.length - 1) {
            setIndex(index + 1);
        } else {
            // Submit
            axios.post('https://zeptoh-backend-3.onrender.com/api/submit', formData)
                .then(res => alert("Submitted successfully"))
                .catch(err => alert("Submission failed"));
        }
    };

    if (!fields.length || index >= fields.length) return <p>Loading...</p>;

    const { label, type } = fields[index];
    return (
        <div style={{ padding: 40 }}>
            <label>{label}</label><br />
            <input
                type={type}
                onBlur={handleBlur}
                onChange={e => handleChange(label, e.target.value)}
                autoFocus
            />
        </div>
    );
}

export default App;