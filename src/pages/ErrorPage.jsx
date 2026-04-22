import React from 'react'
import Breadcrumb from '../components/Breadcrumb'
import ErrorLayer from '../components/ErrorLayer'

const ErrorPage = () => {
  return (
    <>
    <Breadcrumb title={"Error Page"}/>

    <ErrorLayer/>
    
    </>
  )
}

export default ErrorPage