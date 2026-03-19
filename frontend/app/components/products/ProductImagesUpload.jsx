'use client'

import { useState } from 'react';
import Errors from "../Errors";

export default function ProductImagesUpload({ onImagesSelected }) {
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors] = useState({});

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        setErrors({});
    }
}