import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Home from "./components/home";
import Layout from "../layout";
// import Log from '../src/components/logActivity'

function App() {
  return (
    <>
      <Routes>
        <Route path="" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/activity" element={<Log />} /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;
