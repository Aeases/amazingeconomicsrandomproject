import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
//import * as CUtils from '../utils/chartutils'
import { ChangeEvent, useEffect, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import React from "react";

const Home: NextPage = () => {
  const [Country, setCountry] = useState('au')
  const [Target, setTarget] = useState('FR.INR.RINR')
  const APIURL = `https://api.worldbank.org/v2/country/${Country}/indicator/${Target}`
  const GetData = async() => {
    const Data = await fetch(APIURL)
    const ParsedData = new window.DOMParser().parseFromString(await Data.text(), "text/xml")
    return ParsedData
  }
  useEffect(() => {
    const InterestValues = GetData().then((e) => GetIRFromXML(e))
    const years = InterestValues.then((e) => {setYearState([...e.map.keys()])}).catch((e) => {setYearState(e)})
    const Interests = InterestValues.then((e) => {setInterestRate([...e.map.values()])}).catch((e) => {setInterestRate(e)})
    const name = InterestValues.then((e) => {setCurrentCountryName([...e.names.values()])}).catch((e) => {setCurrentCountryName(e)})
  }, [Target])


  function GetIRFromXML(x: Document) {
    const list = x.getElementsByTagName("wb:data")
    const map = new Map()
    const names = new Map()
    for (let i=0; i<list.length; i++) {
      const ListItem = list[i]
      const ListItemValueUnverified = ListItem?.getElementsByTagName('wb:value').item(0)?.innerHTML
      const ListItemValue = Number(ListItemValueUnverified)
      const ListItemYear = ListItem?.getElementsByTagName('wb:date').item(0)?.innerHTML
      const ListItemName = ListItem?.getElementsByTagName('wb:country').item(0)?.innerHTML
      // ! I Hate XML
      if (ListItemValue > 0 || ListItemValue < 0) {
        console.log(ListItemName)
        map.set(ListItemYear, ListItemValue)
        names.set(i, ListItemName)
      }
    }
    return({map, names})
  }


  const [yearState, setYearState] = useState([0])
  const [InterestRate, setInterestRate] = useState([0])
  const [CurrentCountryName, setCurrentCountryName] = useState([''])

  
  const chartData = {
    labels: yearState,
    datasets: [{
      label: CurrentCountryName.at(0),
      data: InterestRate,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const inputField = React.useRef() as React.MutableRefObject<HTMLInputElement>;


  return (
    <>
      <Head>
        <title>Interest Rates for Places</title>
        <meta name="Economics Interest Rates" content="t3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#02306d] to-[#072751] max-h-[100vh] overflow-hidden">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Interest <span className="text-[hsl(117,71%,54%)]">Rates</span> for <span className="text-[hsl(0,100%,59%)]">Places</span>
          </h1>
          <div className="flex gap-2 p-2 bg-[#09c6ff7c] rounded-md">
          <select value={Country} onChange={(e) => setCountry(e.target.value)}>
            <option value="au">Australia</option>
            <option value="eu">European Union</option>
            <option value="cn">China</option>
            <option value="usa">America</option>
            <option value="zw">Zimbabwe</option>
            <option value="pl">Poland</option>
            <option value="jp">Japan</option>
          </select>
          <input ref={inputField} type="text" placeholder="e.g. usa or au" className="p-2 w-12"/>
          <button onClick={() => {setCountry(inputField.current.value)}} className="p-2 hover:bg-slate-400 transition-colors">Check Country</button> 
          <select value={Target} onChange={(e) => setTarget(e.target.value)}>
            <option value="FR.INR.RINR">Real Interest Rates (%)</option>
            <option value="NY.GDP.MKTP.CD">GDP (Current $USD)</option>
            <option value="SP.DYN.IMRT.IN">Infant Mortality Rate (per 1,000 Live Births)</option>
            <option value="SP.POP.TOTL">Population</option>
            <option value="EN.ATM.CO2E.KT">Carbon Emissions (kt)</option>
            <option value="SH.STA.SUIC.P5">Suicide Rate (per 100,000)</option>
            <option value="SI.POV.GINI">Gini Index</option>
            <option value="VC.IHR.PSRC.P5">Homicide Rate (per 100,000 people)</option>
          </select>
          </div>

          <p className="text-white">Made Using <a href="https://www.chartjs.org/" className="text-blue-400 underline">Chart.js</a>, the <a href="https://create.t3.gg/" className="text-blue-400 underline">T3 Stack</a>, and with <a href="https://data.worldbank.org/" className="text-blue-400 underline">Data from the World Bank</a></p>
          <Chart type='line' data={chartData}/>
        </div>
      </main>
    </>
  );
};

export default Home;
