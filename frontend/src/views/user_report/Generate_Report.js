import React, { useState, useEffect, useRef } from 'react'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CCol,
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink, CSidebar, CSidebarNav, CSidebarBrand, CSidebarHeader
} from '@coreui/react';
import CIcon from '@coreui/icons-react'

import { cilLockLocked, cilUser, cilBuilding, cilChartPie, cilArrowRight, cilSpeedometer, cilLayers, cilCloudDownload } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import toast from 'react-hot-toast'
import { useLocation, Link } from 'react-router-dom'
import { User_Import } from './Innerpage/User_Import';
import { PDFDownloadLink, Document, Page, Text, View } from '@react-pdf/renderer';
import Cookies from 'js-cookie'
const Generate_Report = () => {

  const [isshown, setIsShown] = useState("urImport");
  const [branchdata, setbranchdata] = useState([]);
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const branchnames = localStorage.getItem('branchnames');
    if (branchnames) {
      try {
        // Parse the JSON-like string
        const parsedData = JSON.parse(branchnames.replace(/'/g, '"'));
        setbranchdata(parsedData);
      } catch (error) {
        console.error("Error parsing branch names:", error);
      }
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = Cookies.get('userauthtoken');
      if (!token){
        navigate('/login')
      }
    };
    checkToken();
  }, []);

  const handleDataFetch = (data) => {
    setReportData(data);
  };

  // const handleDownload = async () => {
  //   // Generate PDF document using reportData and trigger download
  //   if (reportData) {
  //     const MyDocument = () => (
  //       <Document>
  //         <Page>
  //           <Text>{JSON.stringify(reportData)}</Text>
  //         </Page>
  //       </Document>
  //     );

  //     // Trigger download
  //     const blob = await MyDocument.toBlob();
  //     const url = URL.createObjectURL(blob);

  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'user_import_data.pdf';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   }
  // };


  const styles = {
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
    },
    text: {
      margin: 10,
    },
  }


  // const renderDataUI = () => {
  //   if (!reportData) return null;

  //   const { allData, groupedData, nonNegativeCount, originalData } = reportData;

  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.text}>Report Data</Text>
  //       <Text style={styles.text}>Name: {allData.name}</Text>
  //       <Text style={styles.text}>Non-negative Count: {nonNegativeCount}</Text>

  //       {/* Rendering total jobs */}
  //       <Text style={styles.text}>Total Jobs:</Text>
  //       {allData.totalJobs.map((job, index) => (
  //         <Text key={index} style={styles.text}>{job.property}</Text>
  //       ))}

  //       {/* Rendering access */}
  //       <Text style={styles.text}>Access:</Text>
  //       {allData.access.map((access, index) => (
  //         <Text key={index} style={styles.text}>{access.property}</Text>
  //       ))}

  //       {/* Rendering grouped data */}
  //       {/* <Text style={styles.text}>Grouped Data:</Text> */}
  //       {Object.keys(groupedData).map((key, index) => (
  //         <View key={index} style={styles.container}>
  //           <Text style={styles.text}>{key}:</Text>
  //           {groupedData[key].map((item, idx) => (
  //             <Text key={idx} style={styles.text}>{item.property}</Text>
  //           ))}
  //         </View>
  //       ))}

  //       {/* Rendering completed rows */}
  //       <Text style={styles.text}>Completed Rows:</Text>
  //       {originalData.completedRows.map((row, index) => (
  //         <Text key={index} style={styles.text}>{row.property}</Text>
  //       ))}
  //     </View>
  //   );
  // };

  const renderBranchNames = () => {
    if (branchdata.length === 0) {
      return <p>No branch data available</p>;
    }

    // Join branch names with commas
    const branchNamesString = branchdata.join(', ');

    return <h4>{branchNamesString}</h4>;
  };


  return (
    <div>
      <CCol xs={12}>
        <CCard className="mb-2 container-div">
          <CCardBody>
            <div className='grid-container'>
              <div>
                <label for="Branch" className='text-field-3'>Full Name</label>
                <h4>{localStorage.getItem('fullname')}</h4>
              </div>
              <div>
                <label for="User Name" className='text-field-3'>User Name</label>
                <h4>{localStorage.getItem('empnameforaccess')}</h4>
              </div>


              <div className='branch-container'>
                <label>Branch Access to {localStorage.getItem('fullname')}</label>
                <div className='branch-items'>
                  {renderBranchNames()}
                </div>
              </div>

              {/* <PDFDownloadLink
                document={
                  <Document>
                    <Page>
                      {renderDataUI()}
                    </Page>
                  </Document>
                }
                fileName="user_import_data.pdf"
              >
                {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download PDF')}
              </PDFDownloadLink> */}
            </div>


          </CCardBody>
        </CCard>
      </CCol>
      <CNav variant="tabs" className='nav-link-text userlist-cnav-cusros'>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urImport' ? 'active' : ''}`} onClick={() => { setIsShown("urImport") }}>Import</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urExport' ? 'active' : ''}`} onClick={() => { setIsShown("urExport") }}>Export</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urTransport' ? 'active' : ''}`} onClick={() => { setIsShown("urTransport") }}>Transport</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urFF' ? 'active' : ''}`} onClick={() => { setIsShown("urFF") }}>Freight Forwarding</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urSales' ? 'active' : ''}`} onClick={() => { setIsShown("urSales") }}>Sales</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urAccounts' ? 'active' : ''}`} onClick={() => { setIsShown("urAccounts") }}>Accounts</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink className={`nav-link ${isshown === 'urCrm' ? 'active' : ''}`} onClick={() => { setIsShown("urCrm") }}>CRM</CNavLink>
        </CNavItem>
      </CNav>

      {isshown === "urImport" && <User_Import onDataFetch={handleDataFetch} />}

    </div>

  )
}

export default Generate_Report;
