import React, { useState, useEffect } from 'react'
import {
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton, CPopover
} from '@coreui/react';
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilBuilding, cilChartPie, cilArrowRight } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import { useLocation, Link } from 'react-router-dom'

const User_Report = () => {

    const [allData, setAllData] = useState([]);
    const [branchaccess, setbranchaccess] = useState([])
    const navigate = useNavigate();
    const [userAccessData, setuserAccessData] = useState([])
    const location = useLocation();
    const [userBranchCount, setUserBranchCount] = useState({});
    
    useEffect(() => {
        const checkToken = async () => {
          const token = Cookies.get('userauthtoken');
          if (!token){
            navigate('/login')
          }
        };
        checkToken();
      }, []);


    if (location.pathname === '/user_report') {
        localStorage.removeItem('empnameforaccess');
        localStorage.removeItem('branchnames');
        localStorage.removeItem('fullname');
    }


    useEffect(() => {
        const fetchAllUsernames = async () => {
            try {
                const codeoforg = localStorage.getItem('orgcode');
                const nameoforg = localStorage.getItem('orgname');
                // const username = localStorage.getItem('empnameforaccess');
                const response = await axios.get('http://localhost:5000/fetchAllusers', {
                    params: {
                        orgcode: codeoforg,
                        orgname: nameoforg,
                        // username: username
                    }
                });
                setAllData(response.data.rows);
                setuserAccessData(response.data.row);
                setbranchaccess(response.data.branchaccess); 

            } catch (error) {
                console.log('Error: ' + error);
            }
        };
        fetchAllUsernames();
    }, []);
    

    useEffect(() => {
        if (allData.length > 0 && branchaccess.length > 0) {
            const branchNames = {};

            branchaccess.forEach(accessItem => {
                allData.forEach(dataItem => {
                    if (dataItem.username === accessItem.username) {
                        if (!branchNames[dataItem.username]) {
                            branchNames[dataItem.username] = [];
                        }
                        branchNames[dataItem.username].push(accessItem.ownbranchname);
                       
                    }
                });
            });

            setUserBranchCount(branchNames);
        }
    }, [allData, branchaccess]);



    const handleAccess = async (index) => {
        // Access the username at the specified index in the allData state
        const username = allData[index].username;
        const response = await axios.get('http://localhost:5000/getAccessedRowsforauser', {
            params: {
                username: username
            }
        });
        localStorage.setItem('accessedRows', JSON.stringify(response.data));
        // Store the username in localStorage
        localStorage.setItem('empnameforaccess', username);

        // navigate('/#/UserListAccess');
        // Optionally, you can redirect or perform any other action here
    };


    async function handleNavigate(userdata, branchesaccessofuser){
        
        navigate('/Generate_Report');
        localStorage.setItem('empnameforaccess', userdata.username);
        localStorage.setItem('branchnames', JSON.stringify(branchesaccessofuser));
        localStorage.setItem('fullname', userdata.fullname);

    }


    return (
        <div>
            <CTable hover responsive striped className=''>
                <CTableHead>
                    <CTableRow color='dark'>
                        <CTableHeaderCell scope="col">Full Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Branch</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Access</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Report</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {allData && allData.map((userData, index) => (
                        
                        <CTableRow key={index}>
                            <CTableHeaderCell scope="row">
                                {userData.fullname}
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="row">{userData.username}</CTableHeaderCell>
                            <CTableHeaderCell scope="row">{userBranchCount[userData.username]?.join(', ') || 'No Branches'}</CTableHeaderCell>
                            <CTableDataCell>
                                {userAccessData.some(accessUser => accessUser.username === userData.username) ? 'Import' : 'Access'}
                            </CTableDataCell>
                            <CTableDataCell>
                            {/* <CPopover content="Get this users report" trigger={['hover', 'focus']}> */}
                                <CButton onClick={() => handleNavigate(userData, userBranchCount[userData.username])}>Generate Report</CButton>
                            {/* </CPopover> */}
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>
        </div>
    )
}

export default User_Report;
