import React from 'react'
import Select from 'react-select'

export default function SelectDefault({...props}) {
    return (
        <Select
            isMulti
            className="basic-multi-select"
            classNamePrefix="select"
            {...props}
        />
    )
}
