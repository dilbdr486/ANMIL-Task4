import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Frontend/src/components/navbar'

function Layout() {
  return (
    <>
    <Header/>
    <Outlet/>
    </>
  )
}

export default Layout