import React from 'react'
import Select from 'react-select'

export default function SelectDefault({ isMulti = true, ...props }) {
    return (
        <Select
            isMulti={isMulti}
            className="basic-multi-select"
            classNamePrefix="select"
            {...props}
        />
    )
}
